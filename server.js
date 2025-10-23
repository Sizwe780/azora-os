/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Minimum Viable Ecosystem (MVE) Backend
// Simulates the full Azora ecosystem flow for AU Agriculture Pilot demo

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database file path
const DB_PATH = path.join(__dirname, 'db.json');

// Helper: Read database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return { recommendations: [] };
  }
}

// Helper: Write database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

// Fake Oracle service: Get weather data
function fakeOracle(farmId) {
  console.log(`🛰️ ORACLE: Fetching weather for farm ${farmId}`);
  return {
    temperature: 25 + Math.random() * 10,
    humidity: 60 + Math.random() * 20,
    rainfall: Math.random() * 5,
    windSpeed: Math.random() * 15
  };
}

// Fake Nexus service: Generate recommendation
function fakeNexus(pestReport, weatherData) {
  console.log(`🔍 NEXUS: Analyzing pest ${pestReport.pest} with weather conditions`);

  // Simple logic based on pest and weather
  let recommendation = '';
  let urgency = 'medium';

  if (pestReport.pest.toLowerCase().includes('armyworm')) {
    recommendation = 'Apply neem oil spray immediately';
    urgency = 'high';
  } else if (pestReport.pest.toLowerCase().includes('aphid')) {
    recommendation = 'Introduce ladybird predators';
    urgency = 'medium';
  } else {
    recommendation = 'Monitor closely and apply organic pesticide if needed';
    urgency = 'low';
  }

  // Adjust based on weather
  if (weatherData.temperature > 30) {
    recommendation += ' (avoid spraying during heat)';
  }
  if (weatherData.rainfall > 2) {
    recommendation += ' (timing: after rain stops)';
  }

  return {
    action: recommendation,
    urgency,
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
    timestamp: new Date().toISOString()
  };
}

// Fake Covenant service: Stamp recommendation
function fakeCovenant(recommendation) {
  console.log(`📜 COVENANT: Stamping recommendation with blockchain hash`);
  const hash = '0x' + Math.random().toString(16).substr(2, 64);
  return {
    ...recommendation,
    hash,
    stamped: true,
    blockNumber: Math.floor(Math.random() * 1000000)
  };
}

// Main pest report endpoint
app.post('/api/report-pest', async (req, res) => {
  try {
    const { farmId, pest, description } = req.body;

    console.log(`🐛 PEST REPORT RECEIVED: Farm ${farmId}, Pest: ${pest}`);

    // Step 1: Log the report (Genome simulation)
    console.log('📊 GENOME: Logging pest report event');

    // Step 2: Call Oracle for weather data
    const weatherData = fakeOracle(farmId);

    // Step 3: Generate recommendation via Nexus
    const pestReport = { farmId, pest, description };
    const recommendation = fakeNexus(pestReport, weatherData);

    // Step 4: Stamp with Covenant
    const stampedRecommendation = fakeCovenant(recommendation);

    // Step 5: Store in database
    const db = await readDB();
    const newRecommendation = {
      id: Date.now().toString(),
      farmId,
      pest,
      description,
      weatherData,
      recommendation: stampedRecommendation,
      createdAt: new Date().toISOString()
    };

    db.recommendations.push(newRecommendation);
    await writeDB(db);

    console.log(`✅ RECOMMENDATION GENERATED: ${stampedRecommendation.action}`);

    // Return success response
    res.json({
      success: true,
      message: 'Pest report processed successfully',
      recommendationId: newRecommendation.id,
      preview: stampedRecommendation.action
    });

  } catch (error) {
    console.error('Error processing pest report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process pest report'
    });
  }
});

// Get recommendations endpoint
app.get('/api/recommendations/:farmId', async (req, res) => {
  try {
    const { farmId } = req.params;
    const db = await readDB();

    const farmRecommendations = db.recommendations.filter(r => r.farmId === farmId);

    res.json({
      success: true,
      recommendations: farmRecommendations
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: ['oracle', 'nexus', 'covenant', 'genome'],
    version: 'MVE-1.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Azora MVE Backend running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});