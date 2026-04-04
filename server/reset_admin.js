const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function resetAdmin() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'admin@shop.com'", [hash]);
    console.log("Admin password reset to 'admin123' successfully!");
  } catch (err) {
    console.error("Error resetting admin password:", err.message);
  } finally {
    await pool.end();
  }
}

resetAdmin();
