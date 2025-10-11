import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, AlertTriangle, TrendingDown, Fuel, Clock, Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelCost: number;
  trafficLevel: 'low' | 'medium' | 'high';
  incidents: number;
}

interface TrafficAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  description: string;
  timestamp: string;
}

export default function TrafficRoutingPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(false);

  // Current trip monitoring
  interface CurrentTrip {
    routeId: string;
    startTime: string;
    status: 'in_progress' | 'completed' | 'pending';
  }

  const [currentTrip, setCurrentTrip] = useState<CurrentTrip | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [riskyBehaviors, setRiskyBehaviors] = useState<string[]>([]);

  useEffect(() => {
    fetchTrafficAlerts();
  }, []);

  const fetchTrafficAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:4088/api/traffic/alerts');
      setTrafficAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Fetching traffic alerts failed:', error);
      // Demo alerts
      setTrafficAlerts([
        {
          id: '1',
          severity: 'high',
          type: 'Accident',
          location: 'N1 Highway, 15km from JHB',
          description: 'Multi-vehicle collision causing delays',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          severity: 'medium',
          type: 'Heavy Traffic',
          location: 'M1 Southbound',
          description: 'Congestion during rush hour',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const calculateRoutes = async () => {
    if (!origin || !destination) {
      toast.error('Please enter origin and destination');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:4088/api/routing/calculate', {
        origin,
        destination,
        preferences: {
          avoidTolls,
          avoidHighways: false
        }
      });
      setRoutes(response.data.routes || []);
      toast.success('Routes calculated!');
    } catch (error) {
      console.error('Route calculation failed:', error);
      // Demo routes
      setRoutes([
        {
          id: '1',
          name: 'Fastest Route (via N1)',
          distance: 580,
          duration: 360,
          fuelCost: 1200,
          trafficLevel: 'medium',
          incidents: 1
        },
        {
          id: '2',
          name: 'Shortest Route (via R59)',
          distance: 520,
          duration: 390,
          fuelCost: 1100,
          trafficLevel: 'low',
          incidents: 0
        },
        {
          id: '3',
          name: 'Economical Route (avoiding tolls)',
          distance: 610,
          duration: 420,
          fuelCost: 1050,
          trafficLevel: 'low',
          incidents: 0
        }
      ]);
      toast.success('Routes calculated! (Demo)');
    } finally {
      setLoading(false);
    }
  };

  const startRoute = (route: Route) => {
    setSelectedRoute(route);
    setCurrentTrip({
      routeId: route.id,
      startTime: new Date().toISOString(),
      status: 'in_progress'
    });
    toast.success(`Started ${route.name}`);
  };

  const fetchTripMonitoring = useCallback(async () => {
    if (!currentTrip) return;

    try {
      const response = await axios.get(`http://localhost:4088/api/trip-monitor/${currentTrip.routeId}`);
      setRiskScore(response.data.riskScore || 0);
      setRiskyBehaviors(response.data.riskyBehaviors || []);
    } catch (error) {
      console.error('Trip monitoring failed:', error);
      // Demo monitoring
      const demoRisk = Math.random() * 100;
      setRiskScore(demoRisk);
      if (demoRisk > 70) {
        setRiskyBehaviors(['Speeding detected', 'Hard braking']);
      } else {
        setRiskyBehaviors([]);
      }
    }
  }, [currentTrip]);

  useEffect(() => {
    const scheduleMonitoring = () => {
      setTimeout(() => {
        void fetchTripMonitoring();
      }, 0);
    };

    scheduleMonitoring();
    const interval = setInterval(scheduleMonitoring, 5000);

    return () => clearInterval(interval);
  }, [fetchTripMonitoring]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-green-500/20 text-green-300 border-green-500/50';
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Traffic & Smart Routing</h1>
        <p className="text-orange-200">Save Time & Fuel - Real-Time Intelligence</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Route Planner */}
        <div className="col-span-2 space-y-6">
          {/* Route Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Route Planner
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Origin</label>
                <input
                  type="text"
                  placeholder="e.g., Johannesburg"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Destination</label>
                <input
                  type="text"
                  placeholder="e.g., Durban"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="avoidTolls"
                  checked={avoidTolls}
                  onChange={(e) => setAvoidTolls(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="avoidTolls" className="text-white">
                  Avoid toll roads
                </label>
              </div>

              <button
                onClick={calculateRoutes}
                disabled={loading}
                className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all font-semibold disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate Routes'}
              </button>
            </div>
          </motion.div>

          {/* Route Options */}
          {routes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-white">Available Routes</h3>
              {routes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 cursor-pointer transition-all border-2 ${
                    selectedRoute?.id === route.id ? 'border-orange-500' : 'border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">{route.name}</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/70 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {route.distance} km
                        </span>
                        <span className="text-white/70 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor(route.duration / 60)}h {route.duration % 60}m
                        </span>
                        <span className="text-white/70 flex items-center gap-1">
                          <Fuel className="w-4 h-4" />
                          R{route.fuelCost}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => startRoute(route)}
                      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
                    >
                      Start
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${getTrafficColor(route.trafficLevel)}`}>
                      Traffic: {route.trafficLevel}
                    </span>
                    {route.incidents > 0 && (
                      <span className="text-sm text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {route.incidents} incident{route.incidents > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Current Trip Monitoring */}
          {currentTrip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Trip Monitoring
              </h3>

              {/* Risk Score Gauge */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70">Accident Risk Score</span>
                  <span className={`font-bold ${riskScore > 70 ? 'text-red-400' : riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {riskScore.toFixed(0)}%
                  </span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskScore}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${riskScore > 70 ? 'bg-red-500' : riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  />
                </div>
              </div>

              {/* Risky Behaviors */}
              {riskyBehaviors.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">⚠️ Alerts</h4>
                  <div className="space-y-2">
                    {riskyBehaviors.map((behavior, index) => (
                      <div key={index} className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                        {behavior}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {riskyBehaviors.length === 0 && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-center">
                  ✓ All clear - Safe driving!
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column - Traffic Alerts */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Traffic Alerts
            </h2>

            <div className="space-y-4">
              {trafficAlerts.length === 0 ? (
                <div className="text-white/50 text-center py-8">No active alerts</div>
              ) : (
                trafficAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold">{alert.type}</span>
                      <span className="text-xs opacity-70">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.location}</p>
                    <p className="text-sm opacity-90">{alert.description}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Savings Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mt-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-green-400" />
              Savings This Month
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-white/70 text-sm mb-1">Fuel Saved</p>
                <p className="text-2xl font-bold text-green-400">R3,450</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Time Saved</p>
                <p className="text-2xl font-bold text-blue-400">18 hours</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Incidents Avoided</p>
                <p className="text-2xl font-bold text-purple-400">12</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
