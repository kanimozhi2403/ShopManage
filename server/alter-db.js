require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log("Running migrations...");
    await pool.query('ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);');
    await pool.query('ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);');
    console.log("Migration successful!");
  } catch (err) {
    console.error("MIGRATION FAILED:");
    console.error(err);
  } finally {
    pool.end();
  }
}
migrate();
