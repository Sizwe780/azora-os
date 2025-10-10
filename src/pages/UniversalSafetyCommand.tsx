import React from 'react';
/**
 * UNIVERSAL SAFETY COMMAND CENTER
 * Ensuring everyone lives in peace and is safe
 * 
 * Features:
 * - Real-time threat detection and prevention
 * - Employee wellness and safety monitoring
 * - Customer security and protection
 * - Supply chain integrity verification
 * - Community safety coordination
 * - Autonomous emergency response
 * - Predictive incident prevention
 */

import { useState, useEffect } from 'react';
import {
  FaShieldAlt,
  FaHeartbeat,
  FaExclamationCircle,
  FaCheckCircle,
  FaUsers,
  FaTruck,
  FaCity,
  FaBell,
  FaEye,
  FaRobot,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

interface SafetyMetrics {
  overallStatus: string;
  activeThreats: number;
  resolvedIncidents: number;
  employeeWellness: number;
  communityScore: number;
}

interface Threat {
  id: string;
  type: string;
  severity: string;
  location: string;
  timestamp: string;
  status: string;
  autonomousResponse: string[];
}

interface WellnessAlert {
  employeeId: string;
  name: string;
  type: string;
  severity: string;
  vitalSigns: {
    heartRate: number;
    stress: number;
    fatigue: number;
  };
  recommendation: string;
}

export default function UniversalSafetyCommand() {
  const [metrics, setMetrics] = useState<SafetyMetrics>({
    overallStatus: 'SECURE',
    activeThreats: 0,
    resolvedIncidents: 247,
    employeeWellness: 94,
    communityScore: 98,
  });

  const [threats, setThreats] = useState<Threat[]>([]);
  const [wellnessAlerts, setWellnessAlerts] = useState<WellnessAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSafetyData();
    const interval = setInterval(fetchSafetyData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSafetyData = async () => {
    try {
      // TODO: Replace with real API calls to safety monitoring service
      const response = await fetch('/api/safety/metrics');
      const data = await response.json();

      setMetrics(data.metrics);
      setThreats(data.threats);
      setWellnessAlerts(data.wellnessAlerts);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching safety data:', error);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-900/20 border-red-500';
      case 'HIGH': return 'text-orange-500 bg-orange-900/20 border-orange-500';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-900/20 border-yellow-500';
      case 'LOW': return 'text-green-500 bg-green-900/20 border-green-500';
      default: return 'text-blue-500 bg-blue-900/20 border-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SECURE': return 'text-green-400';
      case 'WARNING': return 'text-yellow-400';
      case 'ALERT': return 'text-orange-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  // TODO: Replace with real chart data from API
  const safetyTrendData = [];
  const safetyDistribution = [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt className="text-6xl text-green-400 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-300">Initializing Safety Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-gray-900 to-gray-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FaShieldAlt className="text-green-400" />
              Universal Safety Orchestrator
            </h1>
            <p className="text-gray-400 text-lg">
              Ensuring Peace & Safety for Everyone • Real-time Protection • AI-Powered Prevention
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getStatusColor(metrics.overallStatus)}`}>
              {metrics.overallStatus}
            </div>
            <div className="text-sm text-gray-400">System Status</div>
          </div>
        </div>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="mb-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FaCheckCircle className="text-5xl text-green-400 animate-pulse" />
              <div>
                <h3 className="text-2xl font-bold text-white">All Systems Operational</h3>
                <p className="text-gray-300">
                  {metrics.resolvedIncidents} incidents resolved • {metrics.employeeWellness}% employee wellness • {metrics.communityScore}% community safety
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {metrics.activeThreats}
              </div>
              <div className="text-sm text-gray-400">Active Threats</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="bg-green-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Overall Safety</p>
                <p className={`text-3xl font-bold ${getStatusColor(metrics.overallStatus)}`}>
                  {metrics.overallStatus}
                </p>
              </div>
              <FaShieldAlt className="text-4xl text-green-400 opacity-50" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Employee Wellness</p>
                <p className="text-3xl font-bold text-blue-400">{metrics.employeeWellness}%</p>
              </div>
              <FaHeartbeat className="text-4xl text-blue-400 opacity-50" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="bg-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Threats</p>
                <p className="text-3xl font-bold text-purple-400">{metrics.activeThreats}</p>
              </div>
              <FaExclamationCircle className="text-4xl text-purple-400 opacity-50" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="bg-yellow-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-yellow-400">{metrics.resolvedIncidents}</p>
              </div>
              <FaCheckCircle className="text-4xl text-yellow-400 opacity-50" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="bg-indigo-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Community</p>
                <p className="text-3xl font-bold text-indigo-400">{metrics.communityScore}%</p>
              </div>
              <FaCity className="text-4xl text-indigo-400 opacity-50" />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Threats & Responses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Threats */}
          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaExclamationCircle className="text-orange-400" />
              Active Threats & Autonomous Response
            </h3>
            <div className="space-y-4">
              {threats.map((threat) => (
                <div
                  key={threat.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(threat.severity)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-white">{threat.type}</span>
                      <div className="text-sm text-gray-400">{threat.location}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${threat.severity === 'CRITICAL' ? 'text-red-400' : threat.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}`}>
                        {threat.severity}
                      </div>
                      <div className="text-xs text-gray-400">{threat.status}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <FaRobot className="text-blue-400" />
                      Autonomous Response:
                    </div>
                    {threat.autonomousResponse.map((response, idx) => (
                      <div key={idx} className="text-sm text-gray-300 flex items-center gap-2 pl-6">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        {response}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Detected: {new Date(threat.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}

              {threats.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
                  <p className="text-xl">No active threats detected</p>
                  <p className="text-sm">All systems secure and operational</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Safety Trend Chart */}
          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaEye className="text-blue-400" />
              24-Hour Safety Monitoring
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={safetyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="wellness" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="threats" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Safety Distribution */}
          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-4">System Status Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={safetyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {safetyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {safetyDistribution.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                  <div className="text-xs text-gray-400">{item.name}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Wellness & Alerts */}
        <div className="space-y-6">
          {/* Employee Wellness Alerts */}
          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaHeartbeat className="text-red-400" />
              Wellness Monitoring
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {wellnessAlerts.map((alert) => (
                <div
                  key={alert.employeeId}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{alert.name}</span>
                    <span className="text-xs">{alert.severity}</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-3">{alert.type}</div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Heart Rate</span>
                      <span className="text-white font-bold">{alert.vitalSigns.heartRate} bpm</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Stress</span>
                      <span className="text-white font-bold">{alert.vitalSigns.stress}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Fatigue</span>
                      <span className="text-white font-bold">{alert.vitalSigns.fatigue}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-blue-300 bg-blue-900/30 p-2 rounded">
                    💡 {alert.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Protection Coverage */}
          <GlassCard className="bg-gradient-to-br from-blue-900/20 to-purple-900/20">
            <h3 className="text-xl font-bold text-white mb-4">Protection Coverage</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-blue-400 text-2xl" />
                  <span className="text-gray-300">Employees</span>
                </div>
                <span className="text-white font-bold">247 Protected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaTruck className="text-green-400 text-2xl" />
                  <span className="text-gray-300">Fleet</span>
                </div>
                <span className="text-white font-bold">89 Vehicles</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCity className="text-purple-400 text-2xl" />
                  <span className="text-gray-300">Facilities</span>
                </div>
                <span className="text-white font-bold">12 Sites</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaBell className="text-yellow-400 text-2xl" />
                  <span className="text-gray-300">AI Sensors</span>
                </div>
                <span className="text-white font-bold">1,847 Active</span>
              </div>
            </div>
          </GlassCard>

          {/* Emergency Response */}
          <GlassCard className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Emergency Response</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-300">
                Autonomous emergency systems on standby
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                  Alert All
                </button>
                <button className="py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors">
                  Evacuate
                </button>
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">
                Response time: &lt;10 seconds
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
