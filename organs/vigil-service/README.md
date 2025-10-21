# Azora Vigil Service

**Vigil.azora.world** - Plug-and-play AI layer for company cameras/VMS, delivering constant monitoring and actionable alerting with enterprise-grade privacy, security, and interoperability.

## Overview

Vigil provides AI-powered video surveillance capabilities that integrate seamlessly with existing camera systems and VMS platforms. It supports industry standards like ONVIF, RTSP, MQTT, and CloudEvents for maximum compatibility.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Camera/VMS    │───▶│   Edge AI       │───▶│   Event Bus     │───▶│   Alerting      │
│   (ONVIF/RTSP)  │    │   (DeepStream)  │    │   (Kafka/MQTT)  │    │   (Teams/Slack) │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   Storage       │    │   Analytics     │    │   SIEM/SOC      │
│   (WebRTC UI)   │    │   (TimescaleDB) │    │   (Weaviate)    │    │   (CEF/CAP)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Architecture

### Data Plane
- **Camera Ingest**: ONVIF/RTSP pull from cameras, VMS SDK integration
- **Edge Inference**: NVIDIA DeepStream + Triton Inference Server for real-time AI processing
- **Event Creation**: Normalized detections to CloudEvents v1.0 schema

### Control Plane
- **Message Bus**: Kafka for high-throughput streaming, MQTT for lightweight edge alerts
- **Time-Series Storage**: TimescaleDB for alert timelines and metrics
- **Vector Search**: Weaviate for semantic clip retrieval and forensic search

### Experience Layer
- **Alerting**: Webhooks to Teams/Slack, CAP feeds for public safety
- **Dashboards**: WebRTC low-latency viewing, HLS/DASH fallbacks
- **VMS Integration**: Metadata/events back to VMS via SDKs/ONVIF

## Performance Targets

- **Inference Latency**: ≤200 ms per frame
- **FPS per Stream**: ≥25 (codec/bitrate dependent)
- **Alert Delivery**: <2 seconds end-to-end
- **Camera Integration Success**: ≥95% for ONVIF/RTSP cameras
- **False Positive Rate**: ≤5% in defined zones
- **False Negative Rate**: ≤10% for target detections

## Core Capabilities

- Perimeter intrusion, loitering, tailgating, line-crossing detection
- PPE compliance monitoring (helmet, vest, goggles)
- Slip/fall detection in industrial/retail settings
- Vehicle detection and ALPR (license plate recognition)
- Fire/smoke indicators and occupancy analytics

## Interoperability

### Standards Support
- **ONVIF Profiles S/T/G/M**: Streaming, modern codecs, edge storage, metadata
- **RTSP 1.0/2.0**: Media session control and streaming
- **MQTT**: Lightweight pub/sub with QoS semantics
- **WebRTC**: Ultra-low-latency browser/mobile viewing
- **CloudEvents v1.0**: Cross-platform event schema
- **CEF**: SIEM integration
- **EDXL CAP**: Public safety alerting

### VMS Connectors
- **Milestone XProtect**: ONVIF drivers and event ingestion
- **Genetec Security Center**: DAP SDK for certified integrations
- **Axis (VAPIX)**: RTSP event streams and replay extensions
- **Blue Iris**: ONVIF/RTSP endpoints and trigger mapping

## Event Schema

All alerts use CloudEvents v1.0 with consistent JSON structure:

```json
{
  "specversion": "1.0",
  "type": "vigil.azora.alert.perimeter.intrusion",
  "source": "vigil://site/warehouse-3/camera/axis-q6135",
  "id": "1d6c8c2a-1234-4e2b-9c00-71e3b7d1f1ab",
  "time": "2025-10-21T14:28:09.123Z",
  "subject": "zone/loading-bay",
  "datacontenttype": "application/json",
  "data": {
    "severity": "high",
    "confidence": 0.93,
    "frameTs": "2025-10-21T14:28:08.989Z",
    "trackId": "trk-8842",
    "bbox": [612, 404, 732, 560],
    "snapshotUrl": "s3://vigil/alerts/1d6c8c2a.jpg",
    "videoClipUrl": "s3://vigil/clips/1d6c8c2a.mp4",
    "model": "intrusion_v1.2",
    "cameraFov": "axis-q6135",
    "rules": ["after-hours", "no-entry-zone"]
  }
}
```

CEF format for SOC/SIEM:
```
CEF:0|Azora|Vigil|1.0|PERIM_INTR|Perimeter intrusion|10|src=10.20.3.21 shost=axis-q6135 act=alert msg=Zone loading-bay confidence=0.93 externalId=1d6c8c2a cs1Label=clip cs1=s3://vigil/clips/1d6c8c2a.mp4
```

## Tech Stack

- **Edge/Inference**: NVIDIA DeepStream + Triton Inference Server
- **Streaming & Storage**: Kafka, TimescaleDB, Weaviate
- **APIs & SDKs**: REST/GraphQL, MQTT, CloudEvents, Azure Event Grid
- **MLOps**: MLflow Model Registry, CVAT/Label Studio, Triton serving

## Security & Compliance

### POPIA (South Africa)
- **Lawful Processing**: Consent-based data collection
- **Purpose Limitation**: Video analytics only for specified security purposes
- **Data Minimization**: Edge processing, automatic cleanup
- **Information Officer**: Designated compliance contact

### GDPR (European Union)
- **Privacy by Design**: Built-in privacy controls from inception
- **Data Protection Impact Assessment**: Required for video analytics
- **Subject Rights**: Data access, rectification, erasure requests
- **Breach Notification**: 72-hour reporting requirement

### Compliance Defaults
- **Face/Plate Blurring**: Enabled by default for privacy protection
- **Retention Policies**: Configurable 7-30 days with automatic cleanup
- **RBAC Roles**: Admin (full access), Operator (alert management), Viewer (read-only)
- **Encryption**: TLS 1.3 for all communications, AES-256 for data at rest
- **Audit Logging**: All actions logged with tamper-proof timestamps

## API Endpoints

### Camera Management
- `GET /api/vigil/cameras` - List discovered cameras
- `GET /api/vigil/cameras/:id` - Get camera details
- `POST /api/vigil/cameras/discover` - Trigger camera discovery

### Stream Processing
- `POST /api/vigil/streams/:cameraId/start` - Start AI processing for camera
- `POST /api/vigil/streams/:cameraId/stop` - Stop AI processing for camera
- `GET /api/vigil/streams/:cameraId/status` - Check stream health and metrics

### Alert Management
- `GET /api/vigil/alerts` - Query alerts with filters (severity, type, time range)
- `GET /api/vigil/alerts/:id` - Get specific alert details
- `POST /api/vigil/alerts/:id/ack` - Acknowledge alert
- `POST /api/vigil/alerts/:id/escalate` - Escalate alert to higher priority

### System Health
- `GET /health` - Service health check
- `GET /health/liveness` - Kubernetes liveness probe
- `GET /health/readiness` - Kubernetes readiness probe
- `GET /metrics` - Prometheus metrics endpoint

## Environment Variables

- `DATABASE_URL` - PostgreSQL/TimescaleDB connection
- `MQTT_BROKER` - MQTT broker URL
- `KAFKA_BROKERS` - Kafka broker list
- `AZURE_EVENTGRID_TOPIC` - Event Grid topic endpoint
- `AZURE_EVENTGRID_KEY` - Event Grid access key
- `ONVIF_DISCOVERY_TIMEOUT` - Camera discovery timeout
- `RTSP_TIMEOUT` - RTSP connection timeout
- `INFERENCE_ENDPOINT` - Triton server URL
- `MODEL_CONFIG` - JSON model configuration

## Development Setup

1. Install dependencies: `npm install`
2. Configure environment variables
3. Start service: `npm start`
4. For development: `npm run dev`

## Deployment Options

### Edge Appliances
- **Docker Compose**: Single-node deployment with local inference
- **Kubernetes**: Multi-node edge clusters with GPU scheduling
- **NVIDIA Jetson**: Optimized for Jetson Xavier/Orin with DeepStream

### On-Premises
- **Helm Charts**: Kubernetes deployment with ingress and monitoring
- **Docker Swarm**: Container orchestration for smaller deployments
- **Bare Metal**: Direct installation with systemd services

### Cloud
- **Azure**: Managed services with Event Grid and Azure Monitor
- **AWS**: ECS/EKS with CloudWatch and Kinesis
- **GCP**: GKE with Cloud Monitoring and Pub/Sub

### Automation Scripts
- **Helm Chart**: `helm install vigil ./helm/vigil`
- **Docker Compose**: `docker-compose up -d`
- **Ansible Playbooks**: Automated deployment to edge locations

## 12-Week MVP Timeline

**Weeks 1-2**: Discovery & baseline integration
**Weeks 3-4**: Edge pipeline & basic models
**Weeks 5-6**: Eventing & alerting
**Weeks 7-8**: Storage & search
**Weeks 9-10**: Dashboard & WebRTC viewer
**Weeks 11-12**: Compliance & pilot deployment

## Pilot KPIs & Acceptance Criteria

### Performance Metrics
- **Camera Integration**: ≥95% success rate for ONVIF/RTSP cameras
- **Inference Performance**: ≤200ms latency, ≥25 FPS per stream
- **Alert Delivery**: <2 seconds end-to-end from detection to notification

### Accuracy Metrics
- **False Positive Rate**: ≤5% in defined zones
- **False Negative Rate**: ≤10% for target detection types
- **Model Confidence**: ≥80% for production alerts

### System Reliability
- **Uptime**: 99.9% service availability
- **Data Retention**: 100% compliance with configured policies
- **Security**: Zero data breaches during pilot period

### User Experience
- **Dashboard Load Time**: <3 seconds for initial page load
- **Alert Response Time**: <30 seconds average acknowledgment time
- **Mobile Compatibility**: Full functionality on tablets/smartphones

## Observability & Monitoring

### Metrics (Prometheus)
- **Stream Metrics**: FPS per camera, frame drop rate, bandwidth usage
- **Inference Metrics**: Latency per frame, model accuracy, processing queue depth
- **Alert Metrics**: Alert rate, acknowledgment time, false positive/negative rates
- **System Metrics**: CPU/GPU usage, memory consumption, network I/O

### Health Checks
- **Liveness**: `/health/liveness` - Container restart if fails
- **Readiness**: `/health/readiness` - Traffic routing when ready
- **Deep Probe**: `/health/deep` - Full system health including dependencies

### Logging
- **Structured Logs**: JSON format with correlation IDs
- **CloudEvents**: All alerts logged as CloudEvents
- **CEF Export**: SIEM integration for security events
- **Audit Trail**: All configuration changes and user actions

### Tracing
- **Distributed Tracing**: Jaeger integration for request tracing
- **Performance Profiling**: CPU/memory profiling for optimization