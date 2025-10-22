/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description Azora OS Mission Control. This service monitors the health of all other microservices and provides a real-time status feed.
 */
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.MONITORING_PORT || 4100;
const SERVICE_DIR = path.join(__dirname, '..');

// In-memory database for service status
const serviceStatus = {};

// --- WebSocket Broadcasting ---
const broadcastStatus = () => {
  const data = JSON.stringify({ type: 'STATUS_UPDATE', payload: serviceStatus });
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('🛰️ Mission Control Dashboard connected.');
  // Send initial full status on connection
  ws.send(JSON.stringify({ type: 'INITIAL_STATUS', payload: serviceStatus }));
});

// --- Service Discovery and Health Checking ---
const getServices = () => {
  return fs.readdirSync(SERVICE_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name !== 'monitoring'); // Exclude self
};

const checkServiceHealth = async (serviceName, port) => {
  const url = `http://localhost:${port}/health`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000); // 2-second timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (response.ok) {
      serviceStatus[serviceName] = { status: 'online', lastCheck: new Date().toISOString() };
    } else {
      serviceStatus[serviceName] = { status: 'degraded', lastCheck: new Date().toISOString(), error: `Status ${response.status}` };
    }
  } catch (error) {
    serviceStatus[serviceName] = { status: 'offline', lastCheck: new Date().toISOString(), error: error.message };
  } finally {
    clearTimeout(timeout);
  }
};

const runHealthChecks = () => {
  const services = getServices();
  // This is a simple port mapping. A real orchestrator would provide this.
  let port = 4000;
  const promises = services.map(name => {
    // This logic needs to be smarter in a real cluster
    if (name === 'azora-ai') port = 4001;
    if (name === 'south-african-compliance') port = 4090;
    // ... etc. For now, we'll just increment for others
    
    const servicePort = port++;
    return checkServiceHealth(name, servicePort);
  });

  Promise.all(promises).then(() => {
    broadcastStatus();
    console.log('🛰️ Health check cycle complete. Current status broadcasted.');
  });
};

// --- API Endpoints ---
app.get('/health', (req, res) => res.status(200).json({ status: 'online', service: 'monitoring' }));
app.get('/api/status', (req, res) => res.status(200).json(serviceStatus));

// --- Initialization ---
server.listen(PORT, () => {
  console.log(`🛰️ Azora Mission Control is online on port ${PORT}`);
  // Run initial check immediately, then every 15 seconds
  runHealthChecks();
  setInterval(runHealthChecks, 15000);
});