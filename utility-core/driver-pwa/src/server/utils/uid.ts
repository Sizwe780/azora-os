// src/server/utils/uid.ts
import crypto from 'crypto';

export function generateAzoraUID(prefix: string) {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  return `AZORA-${prefix}-${date}-${rand}`;
}
