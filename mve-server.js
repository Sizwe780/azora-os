/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Minimum Viable Ecosystem (MVE) - Gateway & Brain Backend
// Simulates the full Azora Forge Architecture event flow

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'synapse/dist')));

// Database file path
const DB_PATH = path.join(__dirname, 'db.json');

// Initialize database if it doesn't exist
async function initDatabase() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ recommendations: [] }, null, 2));
  }
}

// Fake service functions (simulating the full ecosystem)
async function fakeOracle(pestReport) {
  console.log('🛰️ ORACLE: Fetching weather data for farm', pestReport.farmId);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Fake weather data based on pest type
  const weatherData = {
    temperature: 25 + Math.random() * 10,
    humidity: 60 + Math.random() * 20,
    rainfall: pestReport.pestName.toLowerCase().includes('armyworm') ? 'low' : 'normal'
  };

  console.log('📡 ORACLE: Weather data updated', weatherData);
  return weatherData;
}

async function fakeNexus(pestReport, weatherData) {
  console.log('🔍 NEXUS: Analyzing pest + weather data');

  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate recommendation based on pest and weather
  let recommendation = 'Monitor the situation closely';
  let urgency = 'low';

  if (pestReport.pestName.toLowerCase().includes('armyworm')) {
    if (weatherData.rainfall === 'low') {
      recommendation = 'Apply neem oil immediately to prevent spread';
      urgency = 'high';
    } else {
      recommendation = 'Apply neem oil as preventive measure';
      urgency = 'medium';
    }
  } else if (pestReport.pestName.toLowerCase().includes('aphid')) {
    recommendation = 'Introduce ladybugs as natural predators';
    urgency = 'medium';
  } else {
    recommendation = 'Consult local agricultural extension service';
    urgency = 'low';
  }

  const nexusResult = {
    action: recommendation,
    urgency,
    pest: pestReport.pestName,
    farmId: pestReport.farmId,
    weather: `${weatherData.temperature.toFixed(1)}°C, ${weatherData.humidity.toFixed(0)}% humidity, ${weatherData.rainfall} rainfall`,
    timestamp: new Date().toISOString(),
    type: 'recommendation'
  };

  console.log('🎯 NEXUS: Recommendation generated', nexusResult);
  return nexusResult;
}

async function fakeCovenant(recommendation) {
  console.log('📜 COVENANT: Stamping recommendation to immutable ledger');

  // Simulate blockchain stamping
  await new Promise(resolve => setTimeout(resolve, 300));

  const stamped = {
    ...recommendation,
    hash: '0x' + Math.random().toString(16).substr(2, 64),
    blockNumber: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString()
  };

  console.log('✅ COVENANT: Recommendation stamped', stamped.hash);
  return stamped;
}

async function fakeGenome(event, type) {
  console.log('🧬 GENOME: Logging event to audit trail', type);

  // In real system, this would go to TimescaleDB
  // For demo, just log to console
  console.log('📝 GENOME: Event logged', { type, event, timestamp: new Date().toISOString() });
}

// Server-Sent Events for real-time updates
const clients = new Set();

app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

function sendToClients(data) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// API Routes
app.post('/report', async (req, res) => {
  try {
    const pestReport = req.body;
    console.log('\n🐛 PEST_REPORTED:', pestReport);

    // Log to Genome
    await fakeGenome(pestReport, 'pest_reported');

    // Simulate the full event-driven flow
    const weatherData = await fakeOracle(pestReport);
    const recommendation = await fakeNexus(pestReport, weatherData);
    const stampedRecommendation = await fakeCovenant(recommendation);

    // Log final recommendation to Genome
    await fakeGenome(stampedRecommendation, 'recommendation_stamped');

    // Save to database
    const db = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
    db.recommendations.unshift(stampedRecommendation);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    // Send real-time update to connected clients
    sendToClients(stampedRecommendation);

    console.log('🚀 Full ecosystem flow completed!\n');

    res.json({ success: true, message: 'Pest report processed successfully' });
  } catch (error) {
    console.error('Error processing report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/get_recommendations', async (req, res) => {
  try {
    const db = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
    res.json(db.recommendations || []);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: ['gateway', 'oracle', 'nexus', 'covenant', 'genome'],
    clients: clients.size
  });
});

// Start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Azora MVE Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`\n🔄 Event Flow Simulation:`);
    console.log(`1. Farmer submits pest report`);
    console.log(`2. Oracle fetches weather data`);
    console.log(`3. Nexus generates recommendation`);
    console.log(`4. Covenant stamps to ledger`);
    console.log(`5. Genome logs everything`);
    console.log(`6. Real-time push to farmer app\n`);
  });
}

startServer().catch(console.error);