# Vigil UI

**vigil.azora.world** - Web interface for AI-powered surveillance monitoring and alerting.

## Overview

The Vigil UI provides a modern, responsive dashboard for monitoring camera feeds, viewing alerts, and managing surveillance configurations. Built with Next.js and Material-UI for optimal performance and user experience.

## Features

- **Live Dashboard**: Real-time overview of cameras and recent alerts
- **Camera Management**: View camera status, start/stop AI processing
- **Alert Monitoring**: Browse and filter security alerts with severity levels
- **System Health**: Monitor service status and performance metrics
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **UI Library**: Material-UI (MUI) v5
- **HTTP Client**: Axios for API calls
- **Real-time**: Socket.io for live updates
- **Video Player**: React Player for camera streams
- **Charts**: Recharts for analytics
- **Date Handling**: date-fns

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URLs
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXT_PUBLIC_VIGIL_API_URL`: Vigil service API endpoint (default: http://localhost:3005)

## API Integration

The UI communicates with the Vigil service backend via REST APIs:

- `GET /api/vigil/cameras` - Fetch camera list
- `GET /api/vigil/alerts` - Fetch alerts with filtering
- `POST /api/vigil/streams/:cameraId/start` - Start AI processing

## Components

- **Dashboard**: Main overview page with camera and alert summaries
- **CameraCard**: Individual camera status and controls
- **AlertList**: Scrollable list of recent alerts
- **StatusCards**: System health indicators

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

## Testing

Run tests:
```bash
npm test
```

## Deployment

Build for production:
```bash
npm run build
npm start
```

## Contributing

Follow Azora OS development standards and include proper file headers with integration maps.