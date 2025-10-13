/**
 * Azora OS - AI/ML Engine Service
 *
 * Advanced machine learning capabilities for predictive analytics,
 * demand forecasting, route optimization, and anomaly detection.
 *
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Email: sizwe.ngwenya@azora.world
 */

const express = require('express');
const tf = require('@tensorflow/tfjs');
const tfvis = require('@tensorflow/tfjs-vis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4010;

// ============================================================================
// TENSORFLOW.JS SETUP & MODEL MANAGEMENT
// ============================================================================

class AIMLEngine {
  constructor() {
    this.models = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing AI/ML Engine...');

      // Enable production mode for better performance
      tf.enableProdMode();

      // Initialize backend (WebGL for browser, CPU for Node.js)
      if (typeof window !== 'undefined') {
        await tf.setBackend('webgl');
      } else {
        await tf.setBackend('cpu');
      }

      console.log(`TensorFlow.js backend: ${tf.getBackend()}`);
      this.isInitialized = true;

      return { status: 'initialized', backend: tf.getBackend() };
    } catch (error) {
      console.error('Failed to initialize AI/ML Engine:', error);
      throw error;
    }
  }

  // ============================================================================
  // DEMAND FORECASTING MODEL
  // ============================================================================

  async createDemandForecastingModel() {
    const model = tf.sequential();

    // LSTM layers for time series forecasting
    model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [30, 5] // 30 days, 5 features (demand, weather, events, etc.)
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.lstm({ units: 25 }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    this.models.set('demand_forecasting', model);
    return model;
  }

  async trainDemandModel(trainingData) {
    const model = this.models.get('demand_forecasting') || await this.createDemandForecastingModel();

    const { features, labels } = trainingData;

    const xs = tf.tensor3d(features);
    const ys = tf.tensor2d(labels);

    const history = await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
          }
        }
      }
    });

    return { model: 'demand_forecasting', history: history.history };
  }

  async predictDemand(features) {
    const model = this.models.get('demand_forecasting');
    if (!model) throw new Error('Demand forecasting model not trained');

    const input = tf.tensor3d([features]);
    const prediction = model.predict(input);
    const result = await prediction.data();

    return result[0];
  }

  // ============================================================================
  // ROUTE OPTIMIZATION MODEL
  // ============================================================================

  async createRouteOptimizationModel() {
    const model = tf.sequential();

    // Input: [current_location, destination, traffic_data, weather_data, time_data]
    model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [15] }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));

    // Output: optimal route score and waypoints
    model.add(tf.layers.dense({ units: 10, activation: 'linear' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    this.models.set('route_optimization', model);
    return model;
  }

  async optimizeRoute(routeData) {
    const model = this.models.get('route_optimization') || await this.createRouteOptimizationModel();

    // Prepare input features
    const features = [
      routeData.start.lat, routeData.start.lng,
      routeData.end.lat, routeData.end.lng,
      routeData.traffic_level || 0,
      routeData.weather_condition || 0,
      routeData.time_of_day || 0,
      routeData.day_of_week || 0,
      routeData.distance || 0,
      routeData.historical_avg_time || 0,
      routeData.fuel_efficiency || 0,
      routeData.driver_experience || 0,
      routeData.vehicle_type || 0,
      routeData.priority || 0,
      routeData.special_requirements || 0
    ];

    const input = tf.tensor2d([features]);
    const prediction = model.predict(input);
    const scores = await prediction.data();

    return {
      optimal_score: scores[0],
      alternative_routes: Array.from(scores.slice(1)).map((score, idx) => ({
        route_id: idx + 1,
        score: score,
        confidence: Math.max(0, Math.min(1, score / 10))
      }))
    };
  }

  // ============================================================================
  // ANOMALY DETECTION MODEL
  // ============================================================================

  async createAnomalyDetectionModel() {
    // Autoencoder for unsupervised anomaly detection
    const encoder = tf.sequential();
    encoder.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [20] })); // 20 telemetry features
    encoder.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    encoder.add(tf.layers.dense({ units: 16, activation: 'relu' }));

    const decoder = tf.sequential();
    decoder.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [16] }));
    decoder.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    decoder.add(tf.layers.dense({ units: 20, activation: 'linear' }));

    const model = tf.sequential();
    model.add(encoder);
    model.add(decoder);

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    this.models.set('anomaly_detection', model);
    return model;
  }

  async detectAnomalies(telemetryData) {
    const model = this.models.get('anomaly_detection') || await this.createAnomalyDetectionModel();

    // Prepare telemetry features
    const features = [
      telemetryData.speed || 0,
      telemetryData.acceleration || 0,
      telemetryData.brake_pressure || 0,
      telemetryData.steering_angle || 0,
      telemetryData.engine_rpm || 0,
      telemetryData.fuel_level || 0,
      telemetryData.battery_voltage || 0,
      telemetryData.tire_pressure_avg || 0,
      telemetryData.temperature || 0,
      telemetryData.humidity || 0,
      telemetryData.g_force || 0,
      telemetryData.distance_traveled || 0,
      telemetryData.time_of_day || 0,
      telemetryData.road_condition || 0,
      telemetryData.traffic_density || 0,
      telemetryData.weather_condition || 0,
      telemetryData.driver_heart_rate || 0,
      telemetryData.driver_fatigue_score || 0,
      telemetryData.vehicle_health_score || 0,
      telemetryData.maintenance_due || 0
    ];

    const input = tf.tensor2d([features]);
    const reconstruction = model.predict(input);
    const original = tf.tensor2d([features]);

    // Calculate reconstruction error
    const error = tf.losses.meanSquaredError(original, reconstruction);
    const anomalyScore = await error.data();

    return {
      anomaly_score: anomalyScore[0],
      is_anomaly: anomalyScore[0] > 0.1, // Threshold for anomaly detection
      confidence: Math.max(0, Math.min(1, 1 - anomalyScore[0] / 0.5)),
      features: features
    };
  }

  // ============================================================================
  // FLEET CLUSTERING ALGORITHMS
  // ============================================================================

  async clusterFleet(vehicles) {
    // K-means clustering for fleet optimization
    const features = vehicles.map(vehicle => [
      vehicle.location.lat,
      vehicle.location.lng,
      vehicle.status === 'active' ? 1 : 0,
      vehicle.capacity || 0,
      vehicle.fuel_level || 0,
      vehicle.distance_to_next_pickup || 0
    ]);

    const data = tf.tensor2d(features);
    const k = Math.min(5, Math.floor(vehicles.length / 3)); // Adaptive k

    // Simple k-means implementation
    const centroids = tf.randomUniform([k, features[0].length], -1, 1);
    let clusters = [];

    for (let iter = 0; iter < 10; iter++) {
      // Assign points to nearest centroid
      const distances = tf.sum(tf.square(tf.sub(
        tf.expandDims(data, 1),
        tf.expandDims(centroids, 0)
      )), 2);

      const assignments = tf.argMin(distances, 1);

      // Update centroids
      for (let i = 0; i < k; i++) {
        const clusterPoints = tf.gather(data, tf.where(tf.equal(assignments, i)).flatten());
        if (clusterPoints.shape[0] > 0) {
          centroids[i] = tf.mean(clusterPoints, 0);
        }
      }
    }

    const finalAssignments = await tf.argMin(tf.sum(tf.square(tf.sub(
      tf.expandDims(data, 1),
      tf.expandDims(centroids, 0)
    )), 2), 1).data();

    clusters = Array.from(finalAssignments).map((clusterId, idx) => ({
      vehicle_id: vehicles[idx].id,
      cluster_id: clusterId,
      centroid_distance: 0 // Would calculate actual distance
    }));

    return {
      clusters: clusters,
      centroids: await centroids.array(),
      k: k,
      total_vehicles: vehicles.length
    };
  }

  // ============================================================================
  // MODEL MANAGEMENT
  // ============================================================================

  async saveModel(modelName, path) {
    const model = this.models.get(modelName);
    if (!model) throw new Error(`Model ${modelName} not found`);

    await model.save(`file://${path}`);
    return { model: modelName, saved: true, path };
  }

  async loadModel(modelName, path) {
    const model = await tf.loadLayersModel(`file://${path}`);
    this.models.set(modelName, model);
    return { model: modelName, loaded: true };
  }

  getModelInfo() {
    const info = {};
    for (const [name, model] of this.models) {
      info[name] = {
        layers: model.layers.length,
        input_shape: model.inputs[0].shape,
        output_shape: model.outputs[0].shape
      };
    }
    return info;
  }

  async cleanup() {
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.clear();
    tf.disposeVariables();
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

const aiEngine = new AIMLEngine();

// ============================================================================
// API ENDPOINTS
// ============================================================================

app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-ml-engine',
    initialized: aiEngine.isInitialized,
    models: aiEngine.getModelInfo(),
    memory: tf.memory()
  });
});

app.post('/initialize', async (req, res) => {
  try {
    const result = await aiEngine.initialize();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/demand/forecast', async (req, res) => {
  try {
    const { features } = req.body;
    const prediction = await aiEngine.predictDemand(features);
    res.json({ prediction, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/demand/train', async (req, res) => {
  try {
    const { trainingData } = req.body;
    const result = await aiEngine.trainDemandModel(trainingData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/route/optimize', async (req, res) => {
  try {
    const { routeData } = req.body;
    const result = await aiEngine.optimizeRoute(routeData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/anomaly/detect', async (req, res) => {
  try {
    const { telemetryData } = req.body;
    const result = await aiEngine.detectAnomalies(telemetryData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/fleet/cluster', async (req, res) => {
  try {
    const { vehicles } = req.body;
    const result = await aiEngine.clusterFleet(vehicles);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/models', (req, res) => {
  res.json(aiEngine.getModelInfo());
});

app.post('/model/save/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { path } = req.body;
    const result = await aiEngine.saveModel(name, path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/model/load/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { path } = req.body;
    const result = await aiEngine.loadModel(name, path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// START SERVICE
// ============================================================================

app.listen(PORT, async () => {
  console.log(`Azora AI/ML Engine listening on port ${PORT}`);

  // Auto-initialize on startup
  try {
    await aiEngine.initialize();
    console.log('AI/ML Engine initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AI/ML Engine:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down AI/ML Engine...');
  await aiEngine.cleanup();
  process.exit(0);
});

module.exports = app;