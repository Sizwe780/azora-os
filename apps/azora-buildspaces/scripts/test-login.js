// simple script to verify credential-based login logic
// loads environment, builds prisma client and providers, then tests authorize

// minimal env loader copied from seed script
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const contents = fs.readFileSync(envPath, 'utf-8');
  for (const line of contents.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// replicate DB config
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
pool.on('error', (err) => console.error('[DATABASE] Pool error:', err.message));
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

// inline verifyPassword implementation to avoid importing TS modules
const crypto = require('crypto');
function verifyPassword(password, storedPassword) {
  try {
    const [salt, storedHash] = storedPassword.split(':');
    if (!salt || !storedHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === storedHash;
  } catch (e) {
    console.error('verifyPassword error', e);
    return false;
  }
}

async function main() {
  const email = 'testuser@example.com';
  const password = 'Test12345';

  console.log('Checking credentials for', email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('user not found');
    process.exit(1);
  }
  const ok = user.password && verifyPassword(password, user.password);
  console.log('password verified?', ok);
  console.log('user record id', user.id);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error('error', e);
  process.exit(1);
});
