#!/usr/bin/env node

// load environment variables from .env.local if present (manual parser)
{
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
}

const crypto = require('crypto');

// replicate the same pool+adapter configuration used by the app's database client
// this keeps the script self-contained and avoids importing TS modules
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// build pool with identical defaults from lib/database/client.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
pool.on('error', (err) => {
  console.error('[DATABASE] Pool error:', err.message);
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@azora.world';
  const password = process.env.ADMIN_PASSWORD || 'Azora2026!';

  console.log('Seeding admin user:', email);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', existing.id);
    return;
  }

  const stored = hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Admin',
      password: stored,
      role: 'ADMIN'
    }
  });

  console.log('Created admin user:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
