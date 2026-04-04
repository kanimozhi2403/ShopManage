const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create a sale (POS)
router.post('/', authenticate, async (req, res) => {
  const { items, discount, payment_method, customer_name, customer_phone, notes } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.price_at_sale * item.quantity), 0);
    const total = subtotal - (discount || 0);

    // Insert sale
    const { rows: saleRows } = await client.query(
      'INSERT INTO sales (employee_id, total, discount, payment_method, customer_name, customer_phone, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [req.user.id, total, discount || 0, payment_method || 'cash', customer_name || null, customer_phone || null, notes || null]
    );
    const sale = saleRows[0];

    // Insert sale items + update stock
    for (const item of items) {
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale, subtotal) VALUES ($1,$2,$3,$4,$5)',
        [sale.id, item.product_id, item.quantity, item.price_at_sale, item.price_at_sale * item.quantity]
      );
      await client.query(
        'UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(sale);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Get all sales (with items)
router.get('/', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? `SELECT s.*, u.name as employee_name, (SELECT COALESCE(SUM(quantity), 0) FROM sale_items si WHERE si.sale_id = s.id) as item_count FROM sales s LEFT JOIN users u ON s.employee_id = u.id ORDER BY s.created_at DESC LIMIT 100`
      : `SELECT s.*, u.name as employee_name, (SELECT COALESCE(SUM(quantity), 0) FROM sale_items si WHERE si.sale_id = s.id) as item_count FROM sales s LEFT JOIN users u ON s.employee_id = u.id WHERE s.employee_id = $1 ORDER BY s.created_at DESC LIMIT 50`;

    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single sale with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const saleRes = await pool.query(
      'SELECT s.*, u.name as employee_name FROM sales s LEFT JOIN users u ON s.employee_id = u.id WHERE s.id = $1',
      [req.params.id]
    );
    if (!saleRes.rows.length) return res.status(404).json({ error: 'Sale not found' });

    const itemsRes = await pool.query(
      `SELECT si.*, p.name as product_name FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = $1`,
      [req.params.id]
    );

    res.json({ ...saleRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
