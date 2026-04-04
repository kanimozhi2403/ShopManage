const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all expenses
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.name as recorded_by_name FROM expenses e
       LEFT JOIN users u ON e.recorded_by = u.id ORDER BY e.expense_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add expense
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { category, description, amount, expense_date } = req.body;
  if (!category || !amount) return res.status(400).json({ error: 'Category and amount required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO expenses (category, description, amount, expense_date, recorded_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [category, description, amount, expense_date || new Date().toISOString().split('T')[0], req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update expense
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { category, description, amount, expense_date } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE expenses SET category=$1, description=$2, amount=$3, expense_date=$4 WHERE id=$5 RETURNING *`,
      [category, description, amount, expense_date, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Expense not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
