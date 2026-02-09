#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

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
