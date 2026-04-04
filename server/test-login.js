require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testLogin() {
  try {
    const email = 'admin@shop.com';
    console.log("Testing connection...");
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    console.log("Query returned:", rows.length, "rows");
    
    if (rows.length > 0) {
      console.log("User details:", rows[0]);
    } else {
      console.log("No user found!");
    }
  } catch (err) {
    console.error("FATAL DB ERROR:");
    console.error(err);
  } finally {
    pool.end();
  }
}

testLogin();
