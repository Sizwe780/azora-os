/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const mqtt = require('mqtt')
const crypto = require('crypto')
const forge = require('node-forge')
const winston = require('winston')
const helmet = require('helmet')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'quantum-iot-integration' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// In-memory storage for IoT devices and quantum keys
const iotDevices = new Map()
const quantumKeys = new Map()
const deviceData = new Map()

// Quantum-resistant encryption utilities
class QuantumCrypto {
  static generateKeyPair() {
    // Generate Kyber key pair (simulated for now)
    const privateKey = crypto.randomBytes(32)
    const publicKey = crypto.randomBytes(32)
    return { privateKey, publicKey }
  }

  static encrypt(data, publicKey) {
    // Use AES-256-GCM with quantum-resistant key derivation
    const salt = crypto.randomBytes(32)
    const key = crypto.pbkdf2Sync(publicKey, salt, 100000, 32, 'sha256')
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher('aes-256-gcm', key)
    cipher.setIV(iv)

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  static decrypt(encryptedData, privateKey) {
    const { encrypted, iv, salt, authTag } = encryptedData
    const key = crypto.pbkdf2Sync(privateKey, Buffer.from(salt, 'hex'), 100000, 32, 'sha256')
    const decipher = crypto.createDecipher('aes-256-gcm', key)
    decipher.setIV(Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
  }
}

// MQTT Client for IoT communication
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883')

mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker')
  mqttClient.subscribe('iot/devices/+/data')
  mqttClient.subscribe('iot/devices/+/status')
  mqttClient.subscribe('quantum/keys/+')
})

mqttClient.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString())
    const deviceId = topic.split('/')[2]

    if (topic.includes('/data')) {
      handleDeviceData(deviceId, payload)
    } else if (topic.includes('/status')) {
      handleDeviceStatus(deviceId, payload)
    } else if (topic.includes('quantum/keys')) {
      handleQuantumKeyUpdate(deviceId, payload)
    }
  } catch (error) {
    logger.error('Error processing MQTT message:', error)
  }
})

// Device data handler
function handleDeviceData(deviceId, data) {
  const device = iotDevices.get(deviceId)
  if (!device) {
    logger.warn(`Unknown device: ${deviceId}`)
    return
  }

  // Decrypt data if encrypted
  let decryptedData = data
  if (data.encrypted) {
    const privateKey = quantumKeys.get(deviceId)
    if (privateKey) {
      decryptedData = QuantumCrypto.decrypt(data, privateKey)
    }
  }

  // Store device data
  deviceData.set(deviceId, {
    ...decryptedData,
    timestamp: new Date().toISOString(),
    deviceId
  })

  // Emit to connected clients
  io.emit('device-data', { deviceId, data: decryptedData })

  // Check compliance
  checkDeviceCompliance(deviceId, decryptedData)

  logger.info(`Processed data from device ${deviceId}`)
}

// Device status handler
function handleDeviceStatus(deviceId, status) {
  const device = iotDevices.get(deviceId)
  if (device) {
    device.status = status.status
    device.lastSeen = new Date().toISOString()
    iotDevices.set(deviceId, device)

    io.emit('device-status', { deviceId, status: device.status })
    logger.info(`Device ${deviceId} status: ${status.status}`)
  }
}

// Quantum key update handler
function handleQuantumKeyUpdate(deviceId, keyData) {
  quantumKeys.set(deviceId, keyData.privateKey)
  logger.info(`Updated quantum keys for device ${deviceId}`)
}

// Compliance checking
function checkDeviceCompliance(deviceId, data) {
  const device = iotDevices.get(deviceId)
  if (!device) return

  const complianceIssues = []

  // Check data integrity
  if (!data.checksum || !verifyChecksum(data)) {
    complianceIssues.push('Data integrity violation')
  }

  // Check encryption
  if (!data.encrypted) {
    complianceIssues.push('Unencrypted data transmission')
  }

  // Check timestamp freshness
  const dataAge = Date.now() - new Date(data.timestamp).getTime()
  if (dataAge > 300000) { // 5 minutes
    complianceIssues.push('Stale data')
  }

  // Check device health
  if (data.batteryLevel && data.batteryLevel < 20) {
    complianceIssues.push('Low battery level')
  }

  if (complianceIssues.length > 0) {
    const alert = {
      alertId: uuidv4(),
      deviceId,
      type: 'device-compliance',
      severity: complianceIssues.length > 2 ? 'critical' : 'high',
      message: `Compliance issues detected for device ${deviceId}`,
      details: complianceIssues,
      timestamp: new Date().toISOString()
    }

    io.emit('compliance-alert', alert)
    logger.warn(`Compliance alert for device ${deviceId}:`, complianceIssues)
  }
}

// Checksum verification
function verifyChecksum(data) {
  const { checksum, ...dataWithoutChecksum } = data
  const calculatedChecksum = crypto
    .createHash('sha256')
    .update(JSON.stringify(dataWithoutChecksum))
    .digest('hex')
  return calculatedChecksum === checksum
}

// API Routes
app.get('/api/devices', (req, res) => {
  const devices = Array.from(iotDevices.values())
  res.json({ success: true, data: devices })
})

app.get('/api/devices/:deviceId', (req, res) => {
  const device = iotDevices.get(req.params.deviceId)
  if (!device) {
    return res.status(404).json({ success: false, error: 'Device not found' })
  }
  res.json({ success: true, data: device })
})

app.post('/api/devices', (req, res) => {
  const { deviceId, name, type, location } = req.body

  if (!deviceId || !name) {
    return res.status(400).json({ success: false, error: 'Device ID and name required' })
  }

  const device = {
    deviceId,
    name,
    type: type || 'sensor',
    location: location || 'unknown',
    status: 'offline',
    registeredAt: new Date().toISOString(),
    lastSeen: null
  }

  // Generate quantum key pair
  const keyPair = QuantumCrypto.generateKeyPair()
  quantumKeys.set(deviceId, keyPair.privateKey)

  iotDevices.set(deviceId, device)

  // Publish device registration
  mqttClient.publish(`iot/devices/${deviceId}/register`, JSON.stringify({
    deviceId,
    publicKey: keyPair.publicKey.toString('hex'),
    timestamp: new Date().toISOString()
  }))

  res.json({ success: true, data: device, publicKey: keyPair.publicKey.toString('hex') })
})

app.get('/api/devices/:deviceId/data', (req, res) => {
  const data = deviceData.get(req.params.deviceId)
  if (!data) {
    return res.status(404).json({ success: false, error: 'No data found for device' })
  }
  res.json({ success: true, data })
})

app.get('/api/keys/:deviceId', (req, res) => {
  const privateKey = quantumKeys.get(req.params.deviceId)
  if (!privateKey) {
    return res.status(404).json({ success: false, error: 'Keys not found for device' })
  }
  res.json({ success: true, data: { privateKey: privateKey.toString('hex') } })
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    devices: iotDevices.size,
    uptime: process.uptime()
  })
})

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id)

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id)
  })

  socket.on('subscribe-device', (deviceId) => {
    socket.join(`device-${deviceId}`)
    logger.info(`Client ${socket.id} subscribed to device ${deviceId}`)
  })

  socket.on('unsubscribe-device', (deviceId) => {
    socket.leave(`device-${deviceId}`)
    logger.info(`Client ${socket.id} unsubscribed from device ${deviceId}`)
  })
})

// Error handling
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

const PORT = process.env.PORT || 4088

server.listen(PORT, () => {
  logger.info(`Quantum IoT Integration service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
  })
})

module.exports = app