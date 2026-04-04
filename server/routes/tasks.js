const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get tasks (admin sees all, employee sees own)
router.get('/', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? `SELECT t.*, u.name as employee_name, a.name as assigned_by_name FROM tasks t
         LEFT JOIN users u ON t.employee_id = u.id LEFT JOIN users a ON t.assigned_by = a.id ORDER BY t.created_at DESC`
      : `SELECT t.*, a.name as assigned_by_name FROM tasks t
         LEFT JOIN users a ON t.assigned_by = a.id WHERE t.employee_id = $1 ORDER BY t.created_at DESC`;
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { employee_id, title, description, due_date } = req.body;
  if (!employee_id || !title) return res.status(400).json({ error: 'Employee and title required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (employee_id, assigned_by, title, description, due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [employee_id, req.user.id, title, description, due_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status (specific route for frontend parity)
router.put('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task details (admin)
router.put('/:id', authenticate, async (req, res) => {
  const { status, title, description, due_date } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET status=COALESCE($1, status), title=COALESCE($2, title), description=COALESCE($3, description), due_date=COALESCE($4, due_date)
       WHERE id=$5 RETURNING *`,
      [status, title, description, due_date, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
