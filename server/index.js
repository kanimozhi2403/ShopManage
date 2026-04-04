require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const employeeRoutes = require('./routes/employees');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost (development)
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any Vercel domain
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    console.error('CORS blocked for origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
// Auto-initialize database tables and seed admin user
async function initializeDatabase() {
  try {
    // Run schema.sql to create tables
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Database tables initialized');

    // Check if admin exists, if not seed it
    const { rows } = await pool.query("SELECT id FROM users WHERE email = 'admin@shop.com'");
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@shop.com', $1, 'admin')",
        [hash]
      );
      console.log('✅ Admin user created (admin@shop.com / admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;

// Initialize DB then start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
