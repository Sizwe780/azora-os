const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_gLD2S8NTdcyr@ep-falling-king-aim2799b-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});
(async () => {
  try {
    // Add truthScore to Wallet (wallets table)
    await pool.query('ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "truthScore" INTEGER DEFAULT 50;');
    console.log('Wallet columns added successfully');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();