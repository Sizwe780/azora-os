# Quantum IoT Integration Service

A quantum-resistant IoT integration service for Azora OS compliance monitoring that provides secure device communication, real-time data processing, and compliance validation.

## Features

- **Quantum-Resistant Encryption**: Implements post-quantum cryptographic algorithms for secure IoT communication
- **MQTT Integration**: Real-time device communication via MQTT protocol
- **WebSocket Support**: Live data streaming to connected clients
- **Compliance Monitoring**: Automated compliance checking for IoT device data
- **Device Management**: RESTful API for device registration and management
- **Health Monitoring**: Built-in health checks and performance metrics

## Architecture

The service consists of:

- **Express.js API Server**: RESTful endpoints for device management
- **MQTT Client**: Handles IoT device communication
- **WebSocket Server**: Real-time data streaming
- **Quantum Crypto Module**: Post-quantum encryption utilities
- **Compliance Engine**: Automated compliance validation

## API Endpoints

### Device Management

- `GET /api/devices` - Get all registered devices
- `GET /api/devices/:deviceId` - Get device by ID
- `POST /api/devices` - Register new device
- `GET /api/devices/:deviceId/data` - Get latest device data

### Key Management

- `GET /api/keys/:deviceId` - Get quantum keys for device

### Health

- `GET /health` - Service health check

## WebSocket Events

- `device-data` - Real-time device data updates
- `device-status` - Device status changes
- `compliance-alert` - Compliance violation alerts

## Environment Variables

- `PORT` - Service port (default: 4088)
- `MQTT_BROKER` - MQTT broker URL (default: mqtt://localhost:1883)

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Testing

```bash
npm test
```

## Docker

```bash
docker build -t quantum-iot-integration .
docker run -p 4088:4088 quantum-iot-integration
```

## Device Registration

Devices must be registered before they can communicate:

```bash
curl -X POST http://localhost:4088/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "sensor-001",
    "name": "Temperature Sensor",
    "type": "sensor",
    "location": "warehouse-a"
  }'
```

## MQTT Topics

- `iot/devices/+/data` - Device data messages
- `iot/devices/+/status` - Device status updates
- `quantum/keys/+` - Quantum key updates

## Security

- All device data is encrypted using quantum-resistant algorithms
- Data integrity is verified through checksums
- Compliance violations are automatically detected and reported
- Secure key management with automatic key rotation

## Compliance Features

- **Data Integrity**: Verifies data hasn't been tampered with
- **Encryption**: Ensures all data is properly encrypted
- **Freshness**: Checks data timestamp validity
- **Device Health**: Monitors battery levels and connectivity
- **Audit Trail**: Logs all device interactions

## Monitoring

The service provides comprehensive monitoring:

- Device connectivity status
- Data transmission rates
- Compliance violation counts
- System performance metrics
- Real-time alerts and notifications

## Integration

This service integrates with:

- Azora OS Compliance Dashboard
- IoT device networks
- Quantum key distribution systems
- Enterprise monitoring platforms