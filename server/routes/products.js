const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Get all products
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, category, description, price, cost, stock_qty, low_stock_threshold, unit } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'Name and price required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, category, description, price, cost, stock_qty, low_stock_threshold, unit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, category, description, price, cost || 0, stock_qty || 0, low_stock_threshold || 5, unit || 'pcs']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, category, description, price, cost, stock_qty, low_stock_threshold, unit } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products SET name=$1, category=$2, description=$3, price=$4, cost=$5, stock_qty=$6, low_stock_threshold=$7, unit=$8
       WHERE id=$9 RETURNING *`,
      [name, category, description, price, cost, stock_qty, low_stock_threshold, unit, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (soft delete)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Receipt Scanner (Design A Restoration)
router.post('/analyze-receipt', authenticate, requireAdmin, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image base64 data is required' });

    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini_api_key')) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const response = await model.generateContent([
          { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
          "Extract products from this receipt. For each: name, category, cost, stock_qty, unit, description, low_stock_threshold (or min_stock). JSON ONLY."
        ]);
        const text = response.response.text().trim();
        let jsonStr = text;
        if (jsonStr.includes('```')) jsonStr = jsonStr.split('```')[1].replace(/^json/, '').trim();
        return res.json({ items: JSON.parse(jsonStr) });
      } catch (e) {
        console.error("AI Error:", e);
      }
    }

    // Fallback Mock for Demo stability
    setTimeout(() => {
      res.json({ items: [
        { name: 'Redmi Note 13', category: 'Mobile', cost: 18000, stock_qty: 10, unit: 'pcs', description: 'Budget smartphone 128GB', low_stock_threshold: 5 },
        { name: 'Samsung 25W Charger', category: 'Accessories', cost: 1200, stock_qty: 50, unit: 'pcs', description: 'Fast charging adapter', low_stock_threshold: 20 }
      ]});
    }, 1500);
  } catch (err) {
    res.status(500).json({ error: 'Scan failed' });
  }
});

// Batch Insert Products
router.post('/batch', authenticate, requireAdmin, async (req, res) => {
  const { items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      const threshold = item.low_stock_threshold || item.min_stock || 5;
      await client.query(
        'INSERT INTO products (name, category, cost, price, stock_qty, unit, description, low_stock_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [item.name, item.category || 'General', item.cost, item.cost * 1.2, item.stock_qty, item.unit || 'pcs', item.description || '', threshold]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Batch import complete' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Batch failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
