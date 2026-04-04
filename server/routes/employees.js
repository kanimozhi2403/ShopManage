const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all employees
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, phone, address, salary, is_active, created_at FROM users WHERE role = 'employee' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update employee
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, email, phone, address, salary, is_active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users SET name=$1, email=$2, phone=$3, address=$4, salary=$5, is_active=$6
       WHERE id=$7 AND role='employee' RETURNING id, name, email, role, phone, address, salary, is_active`,
      [name, email, phone, address, salary, is_active, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete employee (deactivate)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET is_active = false WHERE id = $1 AND role = 'employee'", [req.params.id]);
    res.json({ message: 'Employee deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
