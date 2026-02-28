/** @jest-environment node */

import { SecurityLayer } from '@/lib/services/security-layer'
import { resetSingleton } from '../../helpers/reset-singleton'

describe('SecurityLayer', () => {
  let layer: SecurityLayer

  beforeEach(() => {
    resetSingleton(SecurityLayer)
    layer = SecurityLayer.getInstance()
  })

  afterEach(() => {
    resetSingleton(SecurityLayer)
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const a = SecurityLayer.getInstance()
      const b = SecurityLayer.getInstance()
      expect(a).toBe(b)
    })
  })

  describe('encrypt / decrypt roundtrip', () => {
    it('should encrypt and decrypt a simple string', () => {
      const plaintext = 'Hello, Azora!'
      const encrypted = layer.encrypt(plaintext)
      expect(encrypted).not.toBe(plaintext)
      expect(layer.decrypt(encrypted)).toBe(plaintext)
    })

    it('should encrypt and decrypt an empty string', () => {
      const plaintext = ''
      const encrypted = layer.encrypt(plaintext)
      expect(layer.decrypt(encrypted)).toBe(plaintext)
    })

    it('should encrypt and decrypt unicode characters', () => {
      const plaintext = '🎉 Ubuntu — "I am because we are" 🌍'
      const encrypted = layer.encrypt(plaintext)
      expect(layer.decrypt(encrypted)).toBe(plaintext)
    })

    it('should encrypt and decrypt a long string', () => {
      const plaintext = 'A'.repeat(10_000)
      const encrypted = layer.encrypt(plaintext)
      expect(layer.decrypt(encrypted)).toBe(plaintext)
    })

    it('should encrypt and decrypt JSON payloads', () => {
      const payload = JSON.stringify({ userId: 'u1', roles: ['admin'], score: 99.5 })
      const encrypted = layer.encrypt(payload)
      expect(JSON.parse(layer.decrypt(encrypted))).toEqual({
        userId: 'u1',
        roles: ['admin'],
        score: 99.5,
      })
    })
  })

  describe('encryption output format', () => {
    it('should produce colon-separated iv:authTag:ciphertext', () => {
      const encrypted = layer.encrypt('test')
      const parts = encrypted.split(':')
      expect(parts).toHaveLength(3)
      // IV is 16 bytes = 32 hex chars
      expect(parts[0]).toHaveLength(32)
      // Auth tag is 16 bytes = 32 hex chars
      expect(parts[1]).toHaveLength(32)
      // Ciphertext is hex
      expect(parts[2].length).toBeGreaterThan(0)
    })

    it('should produce different ciphertext for the same plaintext (random IV)', () => {
      const a = layer.encrypt('same input')
      const b = layer.encrypt('same input')
      expect(a).not.toBe(b)
    })
  })

  describe('tamper detection', () => {
    it('should throw on corrupted ciphertext', () => {
      const encrypted = layer.encrypt('secret')
      const parts = encrypted.split(':')
      // Corrupt the ciphertext
      parts[2] = 'ff'.repeat(parts[2].length / 2)
      expect(() => layer.decrypt(parts.join(':'))).toThrow()
    })

    it('should throw on corrupted auth tag', () => {
      const encrypted = layer.encrypt('secret')
      const parts = encrypted.split(':')
      // Corrupt the auth tag
      parts[1] = '00'.repeat(16)
      expect(() => layer.decrypt(parts.join(':'))).toThrow()
    })
  })

  describe('env key support', () => {
    it('should use AZORA_ENCRYPTION_KEY from env when available', () => {
      const testKey = 'a'.repeat(64) // 32 bytes hex
      process.env.AZORA_ENCRYPTION_KEY = testKey
      resetSingleton(SecurityLayer)
      const envLayer = SecurityLayer.getInstance()

      const encrypted = envLayer.encrypt('env key test')
      expect(envLayer.decrypt(encrypted)).toBe('env key test')

      delete process.env.AZORA_ENCRYPTION_KEY
    })
  })
})
