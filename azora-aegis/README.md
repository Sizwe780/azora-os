# AI Security Monitoring Service v2.0

## 🚀 Advanced AI Security Monitoring Service

An enterprise-grade AI security monitoring service featuring real-time computer vision, advanced threat detection, and intelligent surveillance capabilities for the Azora ES ecosystem.

## ✨ Features

### Core Capabilities
- **Real-time Computer Vision**: TensorFlow.js-powered object detection and classification
- **Advanced Threat Detection**: Multi-layered security analysis with behavioral patterns
- **Anomaly Detection**: Machine learning models for identifying unusual activities
- **Behavioral Analysis**: Intelligent recognition of suspicious behaviors (loitering, crowding, etc.)
- **WebSocket Streaming**: Real-time updates and live camera feeds
- **Camera Management**: Comprehensive camera registration and monitoring

### Enterprise Features
- **Event Bus Integration**: Seamless integration with Azora ES event streaming
- **MongoDB Storage**: Persistent analysis results and historical data
- **Redis Caching**: High-performance caching and real-time data storage
- **Rate Limiting**: API protection and abuse prevention
- **Health Monitoring**: Comprehensive health checks and system monitoring
- **Winston Logging**: Structured logging with multiple transport options

### Security & Compliance
- **Helmet Security**: HTTP security headers and protection
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Graceful error handling with detailed logging

## 🛠 Technology Stack

- **Runtime**: Node.js with Express.js framework
- **AI/ML**: TensorFlow.js, COCO-SSD object detection
- **Databases**: MongoDB (analysis storage), Redis (caching/pubsub)
- **Real-time**: Socket.IO for WebSocket communication
- **Image Processing**: Sharp for high-performance image manipulation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston with structured logging
- **Scheduling**: Node-cron for automated tasks

## 📡 API Endpoints

### Health & Status
- `GET /health` - Comprehensive system health check
- `GET /api/health` - Legacy health endpoint

### Analysis Operations
- `POST /v1/analyze/submit` - Submit media for AI analysis
- `POST /v1/analyze/upload` - Upload media files for analysis
- `GET /v1/analyze/job/:jobId` - Check analysis job status

### Camera Management
- `POST /api/camera/register` - Register new camera feeds
- `GET /api/camera/active` - List active camera feeds
- `GET /api/camera/:cameraId/analysis` - Retrieve camera analysis history

### Analytics & Reporting
- `GET /api/analytics/threats` - Threat analytics and reporting

## 🔧 Configuration

### Environment Variables
```bash
PORT=4600
MONGODB_URL=mongodb://localhost:27017/ai-security
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
LOG_LEVEL=info
```

### Threat Detection Rules
The service includes configurable threat detection rules:
- **Intrusion Detection**: Person/vehicle detection in restricted areas
- **Loitering Detection**: Extended presence monitoring (5+ minutes)
- **Crowd Gathering**: Multi-person congregation alerts
- **Suspicious Behavior**: Pattern recognition for unusual activities

## 🚀 Getting Started

### Installation
```bash
npm install
```

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

### Validation
```bash
node validate.js
```

## 🔍 Analysis Pipeline

1. **Media Ingestion**: Accept images/videos via API or file upload
2. **Preprocessing**: Image optimization and format conversion
3. **Object Detection**: TensorFlow.js COCO-SSD model analysis
4. **Anomaly Detection**: Statistical analysis for unusual patterns
5. **Behavioral Analysis**: Pattern recognition and threat assessment
6. **Threat Classification**: Severity scoring and alert generation
7. **Data Persistence**: MongoDB storage with Redis caching
8. **Real-time Updates**: WebSocket broadcasting to connected clients
9. **Event Publishing**: Integration with Azora ES event bus

## 📊 Data Models

### Analysis Result
```javascript
{
  id: "uuid",
  cameraId: "camera-001",
  timestamp: "2025-01-20T10:30:00Z",
  detections: [...],
  anomaly: { isAnomaly: false, score: 0.2, confidence: 0.8 },
  behaviors: [...],
  threats: [...],
  metadata: { location: {...}, source: "api" }
}
```

### Threat Object
```javascript
{
  type: "LOITERING",
  severity: "MEDIUM",
  confidence: 0.75,
  description: "Person loitering for 8 minutes",
  location: { lat: 40.7128, lng: -74.0060 },
  timestamp: "2025-01-20T10:30:00Z"
}
```

## 🔗 Integration Points

### Event Bus
Publishes threat events to the Azora ES event bus:
```javascript
{
  topic: "security.event.threat_detected",
  message: { threat, analysis }
}
```

### WebSocket Events
Real-time updates via Socket.IO:
- `analysis` - New analysis results
- Camera-specific rooms: `camera:${cameraId}`

## 📈 Performance Characteristics

- **Analysis Speed**: <2 seconds per frame (TensorFlow.js)
- **Concurrent Cameras**: Supports 50+ simultaneous camera feeds
- **Storage**: MongoDB with Redis caching layer
- **Real-time**: WebSocket updates with <100ms latency
- **Scalability**: Horizontal scaling with Redis clustering

## 🛡️ Security Considerations

- API rate limiting (100 requests/15min)
- Input validation and sanitization
- Secure file upload handling
- CORS policy enforcement
- Helmet security headers
- Structured error responses

## 🔄 Maintenance

### Automated Tasks
- **Analysis Cleanup**: Removes old jobs every 30 minutes
- **Camera Health**: Monitors camera connectivity
- **Log Rotation**: Winston handles log file management

### Monitoring
- Health endpoint for load balancer checks
- Prometheus metrics integration
- Structured logging for observability

## 🤝 Contributing

1. Follow the established code patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all dependencies are properly licensed

## 📄 License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.

---

**Azora ES Security Suite** - Making surveillance intelligent, secure, and ethical.