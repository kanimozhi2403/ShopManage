require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testFull() {
  try {
    const email = 'admin@shop.com';
    const password = 'password';
    
    console.log("1. Querying DB...");
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    if (!rows.length) throw new Error("User not found");
    const user = rows[0];
    
    console.log("2. Comparing hash...");
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid?", valid);
    
    console.log("3. Signing JWT...");
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log("JWT generated successfully!");
    
  } catch (err) {
    console.error("EXPECTED ERROR FOUND:");
    console.error(err);
  } finally {
    pool.end();
  }
}
testFull();
