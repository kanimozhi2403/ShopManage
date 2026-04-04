const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkAdmin() {
  try {
    const { rows } = await pool.query("SELECT id, email, role, password_hash FROM users WHERE role = 'admin'");
    if (rows.length === 0) {
      console.log("CRITICAL: No admin user found in database!");
    } else {
      console.log("Admin Users found:");
      rows.forEach(r => console.log(`ID: ${r.id}, Email: ${r.email}, Hash: ${r.password_hash}`));
    }
  } catch (err) {
    console.error("Database connection error:", err.message);
  } finally {
    await pool.end();
  }
}

checkAdmin();
