import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Activity, TrendingUp, Car, User, Zap } from 'lucide-react';
import axios from 'axios';

interface TelemetryData {
  speed: number;
  acceleration: number;
  brake_pressure: number;
  steering_angle: number;
  engine_rpm: number;
  fuel_level: number;
  battery_voltage: number;
  tire_pressure_avg: number;
  temperature: number;
  humidity: number;
  g_force: number;
  distance_traveled: number;
  time_of_day: number;
  road_condition: number;
  traffic_density: number;
  weather_condition: number;
  driver_heart_rate: number;
  driver_fatigue_score: number;
  vehicle_health_score: number;
  maintenance_due: number;
}

interface AnomalyResult {
  anomaly_score: number;
  is_anomaly: boolean;
  confidence: number;
  features: number[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

const AnomalyDetection: React.FC = () => {
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({
    speed: 85,
    acceleration: 0.2,
    brake_pressure: 0.1,
    steering_angle: 5,
    engine_rpm: 2200,
    fuel_level: 75,
    battery_voltage: 12.6,
    tire_pressure_avg: 2.4,
    temperature: 25,
    humidity: 60,
    g_force: 0.8,
    distance_traveled: 15000,
    time_of_day: 14,
    road_condition: 0.3,
    traffic_density: 0.6,
    weather_condition: 0.2,
    driver_heart_rate: 72,
    driver_fatigue_score: 0.3,
    vehicle_health_score: 85,
    maintenance_due: 0
  });

  const [anomalyResult, setAnomalyResult] = useState<AnomalyResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentAnomalies, setRecentAnomalies] = useState<AnomalyResult[]>([]);

  const analyzeTelemetry = async () => {
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/ai-ml/anomaly/detect', { telemetryData });
      const result = response.data;

      // Determine risk level based on anomaly score
      let risk_level: 'low' | 'medium' | 'high' | 'critical';
      if (result.anomaly_score > 0.8) risk_level = 'critical';
      else if (result.anomaly_score > 0.6) risk_level = 'high';
      else if (result.anomaly_score > 0.4) risk_level = 'medium';
      else risk_level = 'low';

      // Generate recommendations based on risk level and features
      const recommendations = generateRecommendations(result, risk_level);

      const fullResult: AnomalyResult = {
        ...result,
        risk_level,
        recommendations
      };

      setAnomalyResult(fullResult);
      setRecentAnomalies(prev => [fullResult, ...prev.slice(0, 4)]); // Keep last 5
    } catch (error) {
      console.error('Anomaly detection failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecommendations = (result: any, riskLevel: string): string[] => {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('🚨 IMMEDIATE ACTION REQUIRED: Stop vehicle and perform safety inspection');
      recommendations.push('📞 Contact emergency services if driver shows signs of distress');
      recommendations.push('🔧 Schedule immediate maintenance check');
    } else if (riskLevel === 'high') {
      recommendations.push('⚠️ High-risk anomaly detected - reduce speed and proceed with caution');
      recommendations.push('👁️ Monitor driver closely for next 30 minutes');
      recommendations.push('📋 Schedule maintenance within 24 hours');
    } else if (riskLevel === 'medium') {
      recommendations.push('🟡 Monitor vehicle systems closely');
      recommendations.push('📅 Schedule routine maintenance check');
      recommendations.push('👤 Check driver fatigue levels');
    } else {
      recommendations.push('✅ Systems operating normally');
      recommendations.push('📊 Continue monitoring as usual');
    }

    // Add specific recommendations based on telemetry
    if (telemetryData.driver_fatigue_score > 0.7) {
      recommendations.push('😴 Driver fatigue detected - recommend rest break');
    }
    if (telemetryData.vehicle_health_score < 70) {
      recommendations.push('🔧 Vehicle health concerns - schedule diagnostic');
    }
    if (telemetryData.speed > 120) {
      recommendations.push('🚗 High speed detected - ensure safe driving conditions');
    }

    return recommendations;
  };

  const updateTelemetry = (field: string, value: number) => {
    setTelemetryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-900/30';
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-900/30';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/30';
      default: return 'text-green-400 border-green-500/30 bg-green-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-400" />
            AI Anomaly Detection
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time anomaly detection for vehicle safety and driver monitoring
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Telemetry Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              Vehicle Telemetry
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Vehicle Metrics */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle Systems
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400">Speed (km/h)</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={telemetryData.speed}
                      onChange={(e) => updateTelemetry('speed', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.speed}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Engine RPM</label>
                    <input
                      type="range"
                      min="800"
                      max="6000"
                      value={telemetryData.engine_rpm}
                      onChange={(e) => updateTelemetry('engine_rpm', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.engine_rpm}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Fuel Level (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={telemetryData.fuel_level}
                      onChange={(e) => updateTelemetry('fuel_level', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.fuel_level}</div>
                  </div>
                </div>
              </div>

              {/* Driver Metrics */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Driver Metrics
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400">Heart Rate (BPM)</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={telemetryData.driver_heart_rate}
                      onChange={(e) => updateTelemetry('driver_heart_rate', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.driver_heart_rate}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Fatigue Score (0-1)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={telemetryData.driver_fatigue_score}
                      onChange={(e) => updateTelemetry('driver_fatigue_score', parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.driver_fatigue_score}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Vehicle Health (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={telemetryData.vehicle_health_score}
                      onChange={(e) => updateTelemetry('vehicle_health_score', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.vehicle_health_score}</div>
                  </div>
                </div>
              </div>

              {/* Environmental Metrics */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Environment
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400">Traffic Density (0-1)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={telemetryData.traffic_density}
                      onChange={(e) => updateTelemetry('traffic_density', parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.traffic_density}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Weather (0-1)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={telemetryData.weather_condition}
                      onChange={(e) => updateTelemetry('weather_condition', parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.weather_condition}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Time of Day (0-23)</label>
                    <input
                      type="range"
                      min="0"
                      max="23"
                      value={telemetryData.time_of_day}
                      onChange={(e) => updateTelemetry('time_of_day', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-white mt-1">{telemetryData.time_of_day}:00</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={analyzeTelemetry}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze for Anomalies'}
            </button>
          </motion.div>

          {/* Anomaly Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Detection Results
            </h2>

            {anomalyResult ? (
              <div className="space-y-4">
                {/* Risk Level */}
                <div className={`p-4 rounded-xl border-2 ${getRiskColor(anomalyResult.risk_level)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="text-lg font-bold uppercase">{anomalyResult.risk_level} Risk</span>
                  </div>
                  <div className="text-sm opacity-90">
                    Anomaly Score: {(anomalyResult.anomaly_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm opacity-90">
                    Confidence: {(anomalyResult.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {anomalyResult.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Analysis Yet</h3>
                <p className="text-gray-500">
                  Adjust telemetry parameters and click "Analyze" to detect anomalies.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Anomalies */}
        {recentAnomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              Recent Anomalies
            </h2>

            <div className="space-y-3">
              {recentAnomalies.map((anomaly, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getRiskColor(anomaly.risk_level)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold uppercase text-sm">{anomaly.risk_level} Risk</span>
                    <span className="text-xs opacity-75">
                      {(anomaly.anomaly_score * 100).toFixed(1)}% anomaly
                    </span>
                  </div>
                  <div className="text-sm opacity-90">
                    {anomaly.recommendations[0]}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Anomaly Detection AI Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">Autoencoder</span>
              </div>
              <p className="text-gray-300 text-sm">Unsupervised learning active</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium">Real-time Analysis</span>
              </div>
              <p className="text-gray-300 text-sm">Continuous telemetry monitoring</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-white font-medium">Risk Assessment</span>
              </div>
              <p className="text-gray-300 text-sm">Multi-level risk classification</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-white font-medium">Predictive Actions</span>
              </div>
              <p className="text-gray-300 text-sm">Automated response recommendations</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnomalyDetection;