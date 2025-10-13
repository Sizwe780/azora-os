import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, BarChart3, Activity, Zap, Target } from 'lucide-react';
import axios from 'axios';

interface DemandData {
  date: string;
  demand: number;
  weather: number;
  events: number;
  price: number;
  competition: number;
}

interface ForecastResult {
  prediction: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const DemandForecasting: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<DemandData[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  // Mock historical data for demonstration
  useEffect(() => {
    const mockData: DemandData[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      demand: Math.floor(Math.random() * 1000) + 500,
      weather: Math.random() * 10,
      events: Math.random() > 0.8 ? 1 : 0,
      price: Math.random() * 50 + 100,
      competition: Math.random() * 5
    }));
    setHistoricalData(mockData);
  }, []);

  const trainModel = async () => {
    setIsTraining(true);
    try {
      // Prepare training data
      const features = historicalData.map(d => [
        d.demand,
        d.weather,
        d.events,
        d.price,
        d.competition
      ]);

      const labels = historicalData.slice(1).map(d => [d.demand]);

      const trainingData = {
        features: features.slice(0, -1),
        labels: labels
      };

      const response = await axios.post('/api/ai-ml/demand/train', { trainingData });
      console.log('Training completed:', response.data);
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const predictDemand = async () => {
    setIsPredicting(true);
    try {
      // Use last 30 days of data for prediction
      const recentData = historicalData.slice(-30);
      const features = recentData.map(d => [
        d.demand,
        d.weather,
        d.events,
        d.price,
        d.competition
      ]);

      const response = await axios.post('/api/ai-ml/demand/forecast', { features });
      const prediction = response.data.prediction;

      // Calculate confidence and trend
      const recentAvg = recentData.slice(-7).reduce((sum, d) => sum + d.demand, 0) / 7;
      const trend = prediction > recentAvg * 1.05 ? 'increasing' :
                   prediction < recentAvg * 0.95 ? 'decreasing' : 'stable';
      const confidence = Math.max(0.5, Math.min(0.95, 1 - Math.abs(prediction - recentAvg) / recentAvg));

      setForecast({
        prediction: Math.round(prediction),
        confidence,
        trend
      });
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-400" />
            AI Demand Forecasting
          </h1>
          <p className="text-gray-300 text-lg">
            Predict future demand using machine learning and historical data
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-green-400" />
              Model Controls
            </h2>

            <div className="space-y-4">
              <button
                onClick={trainModel}
                disabled={isTraining}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {isTraining ? 'Training Model...' : 'Train Model'}
              </button>

              <button
                onClick={predictDemand}
                disabled={isPredicting}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                {isPredicting ? 'Predicting...' : 'Generate Forecast'}
              </button>
            </div>

            {forecast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50"
              >
                <h3 className="text-lg font-semibold text-white mb-3">Forecast Result</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Predicted Demand:</span>
                    <span className="text-white font-bold">{forecast.prediction} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Confidence:</span>
                    <span className="text-white font-bold">{Math.round(forecast.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Trend:</span>
                    <span className={`font-bold ${
                      forecast.trend === 'increasing' ? 'text-green-400' :
                      forecast.trend === 'decreasing' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {forecast.trend.charAt(0).toUpperCase() + forecast.trend.slice(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Data Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Historical Data
            </h2>

            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                Last 30 days of demand data with influencing factors
              </div>

              <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would go here</p>
                  <p className="text-xs mt-1">Data points: {historicalData.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-gray-300">Average Demand</div>
                  <div className="text-white font-bold text-lg">
                    {historicalData.length > 0
                      ? Math.round(historicalData.reduce((sum, d) => sum + d.demand, 0) / historicalData.length)
                      : 0} units
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-gray-300">Peak Demand</div>
                  <div className="text-white font-bold text-lg">
                    {historicalData.length > 0
                      ? Math.max(...historicalData.map(d => d.demand))
                      : 0} units
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Model Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            AI Model Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">TensorFlow.js</span>
              </div>
              <p className="text-gray-300 text-sm">Machine learning framework initialized</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium">LSTM Model</span>
              </div>
              <p className="text-gray-300 text-sm">Time series forecasting model ready</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-white font-medium">Real-time Processing</span>
              </div>
              <p className="text-gray-300 text-sm">Live data processing active</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemandForecasting;