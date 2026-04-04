require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    const res = await pool.query("SELECT * FROM users WHERE email = 'admin@shop.com'");
    if (res.rows.length === 0) {
      console.log("Admin user not found. Inserting now...");
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (
          'Admin',
          'admin@shop.com',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          'admin'
        )
      `);
      console.log("Admin user successfully inserted! Password is: admin123");
    } else {
      console.log("Admin user already exists. The credentials should work.");
      // Force update the password to admin123 just in case
      await pool.query(`
        UPDATE users 
        SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', is_active = true
        WHERE email = 'admin@shop.com'
      `);
      console.log("Admin password has been reset to admin123 just to be safe.");
    }
  } catch (err) {
    console.error("Database error:", err.message);
  } finally {
    pool.end();
  }
}

seed();
