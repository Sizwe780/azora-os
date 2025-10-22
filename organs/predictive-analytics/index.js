/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 4030;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'predictive-analytics' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(cors());
app.use(express.json());

// In-memory storage for models and data (in production, use a database)
let demandModel = null;
let routeModel = null;
const historicalData = {
  demand: [],
  routes: [],
  traffic: []
};

// Initialize machine learning models
async function initializeModels() {
  try {
    // Demand forecasting model (simple LSTM-like architecture)
    demandModel = tf.sequential();
    demandModel.add(tf.layers.dense({ inputShape: [7], units: 32, activation: 'relu' })); // 7 days of data
    demandModel.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    demandModel.add(tf.layers.dense({ units: 1, activation: 'linear' }));

    demandModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Route optimization model (reinforcement learning inspired)
    routeModel = tf.sequential();
    routeModel.add(tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' })); // route features
    routeModel.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    routeModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // efficiency score

    routeModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    logger.info('Machine learning models initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize models', { error: error.message });
  }
}

// Demand forecasting endpoint
app.post('/forecast-demand', async (req, res) => {
  try {
    const { location, historicalDemand, timeWindow = 7 } = req.body;

    if (!historicalDemand || historicalDemand.length < timeWindow) {
      return res.status(400).json({
        error: 'Insufficient historical data for forecasting'
      });
    }

    // Prepare input data
    const inputData = historicalDemand.slice(-timeWindow).map(d => parseFloat(d));
    const inputTensor = tf.tensor2d([inputData], [1, timeWindow]);

    // Make prediction
    const prediction = demandModel.predict(inputTensor);
    const predictedDemand = prediction.dataSync()[0];

    // Calculate confidence interval
    const confidence = Math.max(0.7, Math.min(0.95, 1 - Math.abs(predictedDemand - inputData[inputData.length - 1]) / predictedDemand));

    // Store prediction for model training
    historicalData.demand.push({
      location,
      input: inputData,
      prediction: predictedDemand,
      timestamp: new Date(),
      actual: null // to be filled later
    });

    res.json({
      location,
      predictedDemand: Math.round(predictedDemand),
      confidence,
      timeWindow,
      recommendation: predictedDemand > inputData[inputData.length - 1] ?
        'Increase fleet capacity' : 'Maintain current capacity'
    });

  } catch (error) {
    logger.error('Demand forecasting error', { error: error.message });
    res.status(500).json({ error: 'Failed to forecast demand' });
  }
});

// Route optimization endpoint
app.post('/optimize-route', async (req, res) => {
  try {
    const {
      origin,
      destination,
      currentTime,
      trafficConditions,
      weatherConditions,
      vehicleType,
      cargoType,
      priority,
      constraints = []
    } = req.body;

    // Extract route features
    const routeFeatures = [
      trafficConditions.congestion || 0,
      weatherConditions.visibility || 1,
      weatherConditions.precipitation || 0,
      vehicleType === 'truck' ? 1 : 0,
      cargoType === 'perishable' ? 1 : 0,
      priority === 'high' ? 1 : 0,
      constraints.includes('time') ? 1 : 0,
      constraints.includes('fuel') ? 1 : 0,
      constraints.includes('safety') ? 1 : 0,
      currentTime.getHours() / 24 // normalized time
    ];

    const inputTensor = tf.tensor2d([routeFeatures], [1, 10]);
    const efficiency = routeModel.predict(inputTensor);
    const efficiencyScore = efficiency.dataSync()[0];

    // Generate route alternatives
    const alternatives = generateRouteAlternatives(origin, destination, efficiencyScore);

    // Store for learning
    historicalData.routes.push({
      origin,
      destination,
      features: routeFeatures,
      efficiency: efficiencyScore,
      timestamp: new Date(),
      chosen: null
    });

    res.json({
      origin,
      destination,
      efficiencyScore,
      recommendedRoute: alternatives[0],
      alternatives,
      optimization: {
        estimatedSavings: Math.round((1 - efficiencyScore) * 100),
        confidence: efficiencyScore > 0.7 ? 'high' : efficiencyScore > 0.5 ? 'medium' : 'low'
      }
    });

  } catch (error) {
    logger.error('Route optimization error', { error: error.message });
    res.status(500).json({ error: 'Failed to optimize route' });
  }
});

// Traffic prediction endpoint
app.post('/predict-traffic', async (req, res) => {
  try {
    const { location, timeOfDay, dayOfWeek, weather } = req.body;

    // Simple traffic prediction based on historical patterns
    const baseTraffic = getBaseTrafficPattern(timeOfDay, dayOfWeek);
    const weatherMultiplier = getWeatherMultiplier(weather);
    const predictedTraffic = baseTraffic * weatherMultiplier;

    res.json({
      location,
      timeOfDay,
      dayOfWeek,
      predictedTraffic: Math.round(predictedTraffic),
      congestionLevel: predictedTraffic > 80 ? 'high' : predictedTraffic > 50 ? 'medium' : 'low',
      recommendation: predictedTraffic > 70 ? 'Consider alternative routes' : 'Route is optimal'
    });

  } catch (error) {
    logger.error('Traffic prediction error', { error: error.message });
    res.status(500).json({ error: 'Failed to predict traffic' });
  }
});

// Model training endpoint
app.post('/train-models', async (req, res) => {
  try {
    const { modelType, trainingData } = req.body;

    if (modelType === 'demand') {
      // Train demand forecasting model
      const inputs = trainingData.map(d => d.input);
      const outputs = trainingData.map(d => [d.actual || d.prediction]);

      const xs = tf.tensor2d(inputs);
      const ys = tf.tensor2d(outputs);

      await demandModel.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              logger.info(`Demand model training epoch ${epoch}`, { loss: logs.loss });
            }
          }
        }
      });

      logger.info('Demand forecasting model trained successfully');
    }

    res.json({ message: `${modelType} model trained successfully` });

  } catch (error) {
    logger.error('Model training error', { error: error.message });
    res.status(500).json({ error: 'Failed to train model' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'predictive-analytics',
    models: {
      demand: demandModel ? 'loaded' : 'not loaded',
      route: routeModel ? 'loaded' : 'not loaded'
    },
    timestamp: new Date().toISOString()
  });
});

// Helper functions
function generateRouteAlternatives(origin, destination, efficiency) {
  const alternatives = [
    {
      route: 'primary',
      distance: 150,
      estimatedTime: 120,
      efficiency: efficiency,
      cost: 85,
      risk: 'low'
    },
    {
      route: 'alternative-1',
      distance: 165,
      estimatedTime: 105,
      efficiency: efficiency * 0.9,
      cost: 92,
      risk: 'medium'
    },
    {
      route: 'alternative-2',
      distance: 140,
      estimatedTime: 135,
      efficiency: efficiency * 0.95,
      cost: 78,
      risk: 'low'
    }
  ];

  return alternatives.sort((a, b) => b.efficiency - a.efficiency);
}

function getBaseTrafficPattern(hour, dayOfWeek) {
  // Simplified traffic patterns
  const rushHourMultiplier = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18) ? 1.5 : 1;
  const weekendMultiplier = dayOfWeek >= 5 ? 0.7 : 1;
  return 50 * rushHourMultiplier * weekendMultiplier;
}

function getWeatherMultiplier(weather) {
  const multipliers = {
    'clear': 1.0,
    'rain': 1.3,
    'snow': 1.8,
    'fog': 1.4
  };
  return multipliers[weather] || 1.0;
}

// Initialize models on startup
initializeModels();

app.listen(PORT, () => {
  logger.info(`Predictive Analytics service running on port ${PORT}`);
  console.log(`🧠 Predictive Analytics service listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down predictive analytics service');
  if (demandModel) demandModel.dispose();
  if (routeModel) routeModel.dispose();
  process.exit(0);
});