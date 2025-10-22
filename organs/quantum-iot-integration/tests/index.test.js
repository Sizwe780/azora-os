/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const request = require('supertest')
const app = require('./src/index')

describe('Quantum IoT Integration Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('devices')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('Device Management', () => {
    it('should register a new device', async () => {
      const deviceData = {
        deviceId: 'test-device-001',
        name: 'Test IoT Device',
        type: 'sensor',
        location: 'test-lab'
      }

      const response = await request(app)
        .post('/api/devices')
        .send(deviceData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('deviceId', 'test-device-001')
      expect(response.body.data).toHaveProperty('name', 'Test IoT Device')
      expect(response.body).toHaveProperty('publicKey')
    })

    it('should return 400 for invalid device registration', async () => {
      const response = await request(app)
        .post('/api/devices')
        .send({ name: 'Invalid Device' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Device ID and name required')
    })

    it('should get all devices', async () => {
      const response = await request(app)
        .get('/api/devices')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should get device by ID', async () => {
      // First register a device
      await request(app)
        .post('/api/devices')
        .send({
          deviceId: 'test-device-002',
          name: 'Test Device 2'
        })

      const response = await request(app)
        .get('/api/devices/test-device-002')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.deviceId).toBe('test-device-002')
    })

    it('should return 404 for non-existent device', async () => {
      const response = await request(app)
        .get('/api/devices/non-existent')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Device not found')
    })
  })

  describe('Quantum Key Management', () => {
    it('should get quantum keys for device', async () => {
      // First register a device
      await request(app)
        .post('/api/devices')
        .send({
          deviceId: 'test-device-003',
          name: 'Test Device 3'
        })

      const response = await request(app)
        .get('/api/keys/test-device-003')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('privateKey')
    })

    it('should return 404 for keys of non-existent device', async () => {
      const response = await request(app)
        .get('/api/keys/non-existent')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Keys not found for device')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/devices')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })
})