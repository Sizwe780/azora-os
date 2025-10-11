import { useState } from 'react';
import { Shield, HeartPulse, AlertTriangle, CheckCircle, Users, Truck, Building, Bell, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
    </div>
  </div>
);

const mockMetrics = {
  overallStatus: 'SECURE',
  activeThreats: 2,
  resolvedIncidents: 247,
  employeeWellness: 94,
  communityScore: 98,
};

const mockThreats = [
  { id: 'T001', type: 'Unauthorized Access', severity: 'HIGH', location: 'Docking Bay 7', status: 'Contained', autonomousResponse: ['Isolate Area', 'Dispatch Security Drone'] },
  { id: 'T002', type: 'Cyber Anomaly', severity: 'CRITICAL', location: 'Mainframe Core', status: 'Neutralizing', autonomousResponse: ['Quarantine Network Segment', 'Initiate Counter-measures'] },
];

const mockWellnessAlerts = [
  { employeeId: 'AZ-EMP-042', name: 'J. Acker', type: 'High Stress Detected', severity: 'MEDIUM', vitalSigns: { heartRate: 110, stress: 85, fatigue: 60 }, recommendation: 'Suggest 15-min break' },
  { employeeId: 'AZ-EMP-113', name: 'S. Ndlovu', type: 'Fatigue Warning', severity: 'LOW', vitalSigns: { heartRate: 65, stress: 40, fatigue: 75 }, recommendation: 'Recommend caffeine & rest stop' },
];

const safetyTrendData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}:00`,
  incidents: Math.floor(Math.random() * 2),
  threats: Math.floor(Math.random() * 3),
}));

const safetyDistribution = [
  { name: 'Employee', value: 40, color: '#60A5FA' },
  { name: 'Supply Chain', value: 30, color: '#4ADE80' },
  { name: 'Community', value: 20, color: '#A78BFA' },
  { name: 'Cyber', value: 10, color: '#F472B6' },
];

export default function UniversalSafetyCommand() {
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'border-red-500 bg-red-900/20';
      case 'HIGH': return 'border-orange-500 bg-orange-900/20';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-900/20';
      default: return 'border-green-500 bg-green-900/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Universal Safety Orchestrator</h1>
            <p className="text-green-300">AI-Powered Prevention • Real-time Protection for All</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <StatCard icon={Shield} title="Overall Status" value={mockMetrics.overallStatus} color="green" />
        <StatCard icon={HeartPulse} title="Employee Wellness" value={`${mockMetrics.employeeWellness}%`} color="blue" />
        <StatCard icon={AlertTriangle} title="Active Threats" value={mockMetrics.activeThreats} color="purple" />
        <StatCard icon={CheckCircle} title="Resolved Today" value={mockMetrics.resolvedIncidents} color="yellow" />
        <StatCard icon={Users} title="Community Score" value={`${mockMetrics.communityScore}%`} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Threats & Trends */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle className="text-orange-400" />Active Threats & Autonomous Response</h3>
            <div className="space-y-4">
              {mockThreats.map((threat) => (
                <div key={threat.id} className={`p-4 rounded-xl border-l-4 ${getSeverityClass(threat.severity)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{threat.type}</p>
                      <p className="text-sm text-gray-400">{threat.location}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getSeverityClass(threat.severity)}`}>{threat.severity}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-blue-300 flex items-center gap-2"><Bot /> Autonomous Response:</p>
                    <ul className="list-disc list-inside text-gray-300 text-sm pl-2">
                      {threat.autonomousResponse.map((action, i) => <li key={i}>{action}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">24-Hour Threat Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={safetyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="threats" stroke="#F97316" strokeWidth={2} name="Threats" />
                <Line type="monotone" dataKey="incidents" stroke="#EAB308" strokeWidth={2} name="Incidents" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Wellness & Coverage */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><HeartPulse className="text-red-400" />Wellness Alerts</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {mockWellnessAlerts.map((alert) => (
                <div key={alert.employeeId} className={`p-3 rounded-lg ${getSeverityClass(alert.severity)}`}>
                  <p className="font-bold text-white">{alert.name}</p>
                  <p className="text-sm text-gray-300">{alert.type}</p>
                  <p className="mt-2 text-xs text-blue-300 bg-blue-900/30 p-2 rounded">💡 {alert.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Protection Coverage</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Users className="text-blue-400"/>Employees</span><span className="font-bold text-white">247 Protected</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Truck className="text-green-400"/>Fleet</span><span className="font-bold text-white">89 Vehicles</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Building className="text-purple-400"/>Facilities</span><span className="font-bold text-white">12 Sites</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Bell className="text-yellow-400"/>AI Sensors</span><span className="font-bold text-white">1,847 Active</span></div>
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Safety Domain Distribution</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={safetyDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                  {safetyDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}