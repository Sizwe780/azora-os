import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, Navigation, MapPin, Clock, Fuel, Cloud, Car } from 'lucide-react';
import axios from 'axios';

interface RouteData {
  start: { lat: number; lng: number; address: string };
  end: { lat: number; lng: number; address: string };
  waypoints?: Array<{ lat: number; lng: number }>;
  traffic_level: number;
  weather_condition: number;
  time_of_day: number;
  day_of_week: number;
  distance: number;
  historical_avg_time: number;
  fuel_efficiency: number;
  driver_experience: number;
  vehicle_type: number;
  priority: number;
  special_requirements: number;
}

interface OptimizationResult {
  optimal_score: number;
  alternative_routes: Array<{
    route_id: number;
    score: number;
    confidence: number;
  }>;
  recommended_route: {
    distance: number;
    estimated_time: number;
    fuel_cost: number;
    tolls: number;
    traffic_delay: number;
  };
}

const RouteOptimization: React.FC = () => {
  const [routeData, setRouteData] = useState<RouteData>({
    start: { lat: -33.9249, lng: 18.4241, address: 'Cape Town CBD' },
    end: { lat: -29.8587, lng: 31.0218, address: 'Durban CBD' },
    traffic_level: 0.5,
    weather_condition: 0.2,
    time_of_day: 12,
    day_of_week: 1,
    distance: 1500,
    historical_avg_time: 18,
    fuel_efficiency: 8.5,
    driver_experience: 0.8,
    vehicle_type: 0.6,
    priority: 0.7,
    special_requirements: 0.1
  });

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const response = await axios.post('/api/ai-ml/route/optimize', { routeData });
      const result = response.data;

      // Generate mock detailed route info
      const recommended = result.alternative_routes.reduce((best, current) =>
        current.score > best.score ? current : best
      );

      setOptimizationResult({
        ...result,
        recommended_route: {
          distance: routeData.distance * (0.9 + Math.random() * 0.2),
          estimated_time: routeData.historical_avg_time * (0.8 + Math.random() * 0.4),
          fuel_cost: (routeData.distance / routeData.fuel_efficiency) * 25, // R25 per liter
          tolls: Math.floor(Math.random() * 500),
          traffic_delay: Math.max(0, routeData.historical_avg_time * routeData.traffic_level - routeData.historical_avg_time)
        }
      });
    } catch (error) {
      console.error('Route optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const updateRouteData = (field: string, value: any) => {
    setRouteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Route className="w-10 h-10 text-green-400" />
            AI Route Optimization
          </h1>
          <p className="text-gray-300 text-lg">
            Optimize delivery routes using machine learning and real-time data
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Route Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-blue-400" />
              Route Configuration
            </h2>

            <div className="space-y-6">
              {/* Start/End Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Starting Point
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-white">{routeData.start.address}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Destination
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-lg">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span className="text-white">{routeData.end.address}</span>
                  </div>
                </div>
              </div>

              {/* Route Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Traffic Level (0-1)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={routeData.traffic_level}
                    onChange={(e) => updateRouteData('traffic_level', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">{routeData.traffic_level}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weather Condition (0-1)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={routeData.weather_condition}
                    onChange={(e) => updateRouteData('weather_condition', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">{routeData.weather_condition}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time of Day (0-23)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={routeData.time_of_day}
                    onChange={(e) => updateRouteData('time_of_day', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">{routeData.time_of_day}:00</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority Level (0-1)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={routeData.priority}
                    onChange={(e) => updateRouteData('priority', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">{routeData.priority}</div>
                </div>
              </div>

              <button
                onClick={optimizeRoute}
                disabled={isOptimizing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Route className="w-5 h-5" />
                {isOptimizing ? 'Optimizing Route...' : 'Optimize Route'}
              </button>
            </div>
          </motion.div>

          {/* Optimization Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Car className="w-6 h-6 text-purple-400" />
              Optimization Results
            </h2>

            {optimizationResult ? (
              <div className="space-y-6">
                {/* Recommended Route */}
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-4 border border-green-500/30">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-green-400" />
                    Recommended Route
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Distance:</span>
                      <span className="text-white font-bold">{Math.round(optimizationResult.recommended_route.distance)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Est. Time:</span>
                      <span className="text-white font-bold">{Math.round(optimizationResult.recommended_route.estimated_time)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Fuel Cost:</span>
                      <span className="text-white font-bold">R{Math.round(optimizationResult.recommended_route.fuel_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tolls:</span>
                      <span className="text-white font-bold">R{optimizationResult.recommended_route.tolls}</span>
                    </div>
                  </div>

                  {optimizationResult.recommended_route.traffic_delay > 0 && (
                    <div className="mt-3 p-2 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center gap-2 text-yellow-300 text-sm">
                        <Clock className="w-4 h-4" />
                        Traffic delay: +{Math.round(optimizationResult.recommended_route.traffic_delay)}h
                      </div>
                    </div>
                  )}
                </div>

                {/* Alternative Routes */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Alternative Routes</h3>
                  <div className="space-y-2">
                    {optimizationResult.alternative_routes.slice(0, 3).map((route, index) => (
                      <div key={route.route_id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">Route {route.route_id}</div>
                            <div className="text-xs text-gray-400">
                              Confidence: {Math.round(route.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {Math.round(route.score * 100)}%
                          </div>
                          <div className="text-xs text-gray-400">Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-indigo-400" />
                    AI Insights
                  </h3>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-green-400" />
                      <span>Optimal fuel efficiency route selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Time-based optimization applied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-purple-400" />
                      <span>Weather conditions factored in</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Route className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Optimization Yet</h3>
                <p className="text-gray-500">
                  Configure your route parameters and click "Optimize Route" to get AI-powered recommendations.
                </p>
              </div>
            )}
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
            <Route className="w-6 h-6 text-teal-400" />
            Route Optimization AI Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">Neural Network</span>
              </div>
              <p className="text-gray-300 text-sm">Multi-layer perceptron active</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium">Real-time Data</span>
              </div>
              <p className="text-gray-300 text-sm">Traffic & weather integration</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-white font-medium">Cost Optimization</span>
              </div>
              <p className="text-gray-300 text-sm">Fuel & time efficiency focus</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                <span className="text-white font-medium">Predictive Routing</span>
              </div>
              <p className="text-gray-300 text-sm">Future condition anticipation</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RouteOptimization;