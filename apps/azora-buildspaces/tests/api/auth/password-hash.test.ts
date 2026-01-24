/** @jest-environment node */
/**
 * Unit tests for authentication password hashing
 * Tests the password hashing and verification logic used in registration and login
 */


import crypto from 'crypto'

// Helper to hash password (same as in register route)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Helper to verify password (same logic as in authorize function)
function verifyPassword(password: string, storedPassword: string): boolean {
  const [salt, storedHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

describe('Password Hashing and Verification', () => {
  test('hashPassword generates valid hash with salt', () => {
    const password = 'testPassword123!';
    const hashed = hashPassword(password);
    
    // Should contain a colon separator
    expect(hashed).toContain(':');
    
    // Should have two parts: salt and hash
    const parts = hashed.split(':');
    expect(parts).toHaveLength(2);
    
    // Salt should be 32 hex chars (16 bytes)
    expect(parts[0]).toHaveLength(32);
    
    // Hash should be 128 hex chars (64 bytes)
    expect(parts[1]).toHaveLength(128);
  });

  test('verifyPassword returns true for correct password', () => {
    const password = 'mySecurePassword456!';
    const hashed = hashPassword(password);
    
    const isValid = verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });

  test('verifyPassword returns false for incorrect password', () => {
    const correctPassword = 'mySecurePassword456!';
    const wrongPassword = 'wrongPassword789!';
    const hashed = hashPassword(correctPassword);
    
    const isValid = verifyPassword(wrongPassword, hashed);
    expect(isValid).toBe(false);
  });

  test('same password generates different hashes (due to random salt)', () => {
    const password = 'testPassword123!';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);
    
    // Hashes should be different because salts are random
    expect(hash1).not.toBe(hash2);
    
    // But both should verify correctly
    expect(verifyPassword(password, hash1)).toBe(true);
    expect(verifyPassword(password, hash2)).toBe(true);
  });

  test('empty password can be hashed and verified', () => {
    // Note: This test validates the hash function itself works with empty strings.
    // In production, empty passwords should be prevented at the API validation layer
    // (already handled in register route which requires password to be non-empty)
    const password = '';
    const hashed = hashPassword(password);
    
    expect(verifyPassword(password, hashed)).toBe(true);
    expect(verifyPassword('notEmpty', hashed)).toBe(false);
  });

  test('special characters in password are handled correctly', () => {
    const password = 'p@$$w0rd!#%&*()[]{}|;:,.<>?/~`';
    const hashed = hashPassword(password);
    
    expect(verifyPassword(password, hashed)).toBe(true);
    expect(verifyPassword('p@$$w0rd', hashed)).toBe(false);
  });
});
