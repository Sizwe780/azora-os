import React from 'react';
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Database, Lock, Activity } from 'lucide-react';

interface SecurityLayer {
  name: string;
  description: string;
  status: boolean;
  lastCheck: Date;
  checkInterval: string;
}

interface SecurityAlarm {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolved: boolean;
}

interface BackupStatus {
  lastBackup: Date;
  locations: string[];
  size: string;
  nextBackup: Date;
  redundancy: number;
}

interface SecurityData {
  layers: SecurityLayer[];
  alarms: SecurityAlarm[];
  backupStatus: BackupStatus;
  intrusionDetection: {
    active: boolean;
    lastScan: Date;
    threatsDetected: number;
    threatsBlocked: number;
  };
  systemHealth: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
  };
}

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const response = await fetch('/api/hr-ai/security/status');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch security data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurity();
    const interval = setInterval(fetchSecurity, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Failed to load security data</p>
        </div>
      </div>
    );
  }

  const allLayersGreen = data.layers.every(layer => layer.status);
  const criticalAlarms = data.alarms.filter(alarm => alarm.severity === 'critical' && !alarm.resolved);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">5-layer security system, intrusion detection, and backup status</p>
      </div>

      {/* Critical Alerts */}
      {criticalAlarms.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-bold text-red-900 dark:text-red-400">CRITICAL SECURITY ALERTS</h3>
          </div>
          <div className="space-y-2">
            {criticalAlarms.map((alarm) => (
              <div key={alarm.id} className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-sm font-semibold text-red-900 dark:text-red-400">{alarm.type}</p>
                <p className="text-sm text-red-700 dark:text-red-300">{alarm.description}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {new Date(alarm.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Security Status */}
      <div className={`rounded-lg p-6 ${
        allLayersGreen
          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
          : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className={`w-8 h-8 ${allLayersGreen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            <div>
              <h2 className={`text-2xl font-bold ${allLayersGreen ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'}`}>
                {allLayersGreen ? 'ALL SECURITY LAYERS GREEN' : 'SECURITY BREACH DETECTED'}
              </h2>
              <p className={`text-sm ${allLayersGreen ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {allLayersGreen ? 'All systems operational and secure' : 'Immediate attention required'}
              </p>
            </div>
          </div>
          {allLayersGreen && <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />}
        </div>
      </div>

      {/* Security Layers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5-Layer Security System</h2>
        <div className="space-y-3">
          {data.layers.map((layer, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                layer.status
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${layer.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Layer {index + 1}: {layer.name}</h3>
                </div>
                <span className={`text-xs font-semibold ${layer.status ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {layer.status ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{layer.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                <span>Last check: {new Date(layer.lastCheck).toLocaleTimeString()}</span>
                <span>Interval: {layer.checkInterval}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intrusion Detection & Backup Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intrusion Detection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Intrusion Detection</span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Status</span>
              <span className={`font-bold ${data.intrusionDetection.active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {data.intrusionDetection.active ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Last Scan</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(data.intrusionDetection.lastScan).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Threats Detected</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">{data.intrusionDetection.threatsDetected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Threats Blocked</span>
              <span className="font-bold text-red-600 dark:text-red-400">{data.intrusionDetection.threatsBlocked}</span>
            </div>
          </div>
        </div>

        {/* Backup Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Backup System</span>
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(data.backupStatus.lastBackup).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Locations</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.backupStatus.locations.map((location, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded">
                    {location}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Backup Size</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.backupStatus.size}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Redundancy</span>
              <span className="font-bold text-green-600 dark:text-green-400">{data.backupStatus.redundancy}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>System Health</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.systemHealth.uptime}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Memory</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.systemHealth.memoryUsage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">CPU</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.systemHealth.cpuUsage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Response</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{data.systemHealth.responseTime}ms</p>
          </div>
        </div>
      </div>

      {/* Recent Alarms */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Security Alarms</h2>
        {data.alarms.length === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-green-600 dark:text-green-400 font-medium">No security alarms detected</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-3 rounded-lg ${
                  alarm.resolved
                    ? 'bg-gray-50 dark:bg-gray-900/30'
                    : alarm.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{alarm.type}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      alarm.severity === 'critical' ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-400' :
                      alarm.severity === 'high' ? 'bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-400' :
                      'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {alarm.severity.toUpperCase()}
                    </span>
                    {alarm.resolved && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{alarm.description}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(alarm.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
