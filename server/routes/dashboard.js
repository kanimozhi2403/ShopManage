const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Dashboard summary stats
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const start = req.query.start || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const end = req.query.end || new Date().toISOString().split('T')[0];
    const endPlusOne = new Date(new Date(end).setDate(new Date(end).getDate() + 1)).toISOString().split('T')[0];

    const [salesRes, expensesRes, productsRes, employeesRes, recentSalesRes, topProductsRes, monthlySalesRes] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total),0) as total_revenue, COUNT(*) as total_sales FROM sales WHERE created_at >= $1 AND created_at < $2`, [start, endPlusOne]),
      pool.query(`SELECT COALESCE(SUM(amount),0) as total_expenses FROM expenses WHERE expense_date >= $1 AND expense_date <= $2`, [start, end]),
      pool.query(`SELECT COUNT(*) as total_products, COUNT(*) FILTER (WHERE stock_qty <= low_stock_threshold) as low_stock FROM products WHERE is_active = true`),
      pool.query(`SELECT COUNT(*) as total_employees FROM users WHERE role = 'employee' AND is_active = true`),
      pool.query(`SELECT s.id, s.total, s.created_at, u.name as employee_name FROM sales s LEFT JOIN users u ON s.employee_id = u.id WHERE s.created_at >= $1 AND s.created_at < $2 ORDER BY s.created_at DESC LIMIT 5`, [start, endPlusOne]),
      pool.query(`SELECT p.name, SUM(si.quantity) as qty_sold, SUM(si.subtotal) as revenue FROM sale_items si JOIN sales s ON si.sale_id = s.id JOIN products p ON si.product_id = p.id WHERE s.created_at >= $1 AND s.created_at < $2 GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 5`, [start, endPlusOne]),
      pool.query(`SELECT to_char(date_trunc('day', created_at), 'Mon DD') as day, SUM(total) as revenue, COUNT(*) as sales_count FROM sales WHERE created_at >= $1 AND created_at < $2 GROUP BY date_trunc('day', created_at) ORDER BY date_trunc('day', created_at)`, [start, endPlusOne])
    ]);

    const revenue = parseFloat(salesRes.rows[0].total_revenue);
    const expenses = parseFloat(expensesRes.rows[0].total_expenses);

    res.json({
      revenue,
      expenses,
      profit: revenue - expenses,
      total_sales: parseInt(salesRes.rows[0].total_sales),
      total_products: parseInt(productsRes.rows[0].total_products),
      low_stock: parseInt(productsRes.rows[0].low_stock),
      total_employees: parseInt(employeesRes.rows[0].total_employees),
      recent_sales: recentSalesRes.rows,
      top_products: topProductsRes.rows,
      daily_sales: monthlySalesRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Assistant Insights (Design A Restoration)
router.get('/insights', authenticate, requireAdmin, async (req, res) => {
  try {
    const start = req.query.start || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const end = req.query.end || new Date().toISOString().split('T')[0];
    const endPlusOne = new Date(new Date(end).setDate(new Date(end).getDate() + 1)).toISOString().split('T')[0];

    // Fetch Key Data for LLM
    const { rows: stats } = await pool.query(`SELECT COALESCE(SUM(total),0) as revenue FROM sales WHERE created_at >= $1 AND created_at < $2`, [start, endPlusOne]);
    const revenue = parseFloat(stats[0].revenue);
    
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini_api_key')) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(`Analyze shop revenue of ₹${revenue.toLocaleString('en-IN')}. Write a very short encouraging business insight (3 sentences max).`);
        return res.json({ insight: result.response.text() });
      } catch (e) {
        console.error("AI Error:", e);
      }
    }

    res.json({ insight: `Great job! Your current revenue is ₹${revenue.toLocaleString('en-IN')}. Focus on customer retention and upselling accessories to boost growth.` });
  } catch (err) {
    res.status(500).json({ error: 'Insight failed' });
  }
});

module.exports = router;
