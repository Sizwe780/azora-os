import React from 'react';
import { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface SystemHealth {
  api: boolean;
  database: boolean;
  security: boolean;
  monitoring: boolean;
}

interface OperationsData {
  systemHealth: SystemHealth;
  automation: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  tasksAutomated: number;
  tasksTotal: number;
}

export default function OperationsPage() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await fetch('/api/hr-ai/operations/status');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch operations data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
    const interval = setInterval(fetchOperations, 30000); // Every 30 seconds
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
          <p className="text-red-600 dark:text-red-400">Failed to load operations data</p>
        </div>
      </div>
    );
  }

  const allSystemsGreen = Object.values(data.systemHealth).every(status => status);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operations Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time system health, automation, and efficiency metrics</p>
      </div>

      {/* System Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(data.systemHealth).map(([system, status]) => (
          <div
            key={system}
            className={`rounded-lg shadow-lg p-6 ${
              status
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            } text-white`}
          >
            {status ? (
              <CheckCircle className="w-8 h-8 mb-2" />
            ) : (
              <XCircle className="w-8 h-8 mb-2" />
            )}
            <p className="text-sm opacity-90 capitalize">{system}</p>
            <p className="text-2xl font-bold mt-1">{status ? 'ONLINE' : 'OFFLINE'}</p>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className={`rounded-lg shadow-lg p-6 ${
        allSystemsGreen
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center space-x-3">
          {allSystemsGreen ? (
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          )}
          <h2 className={`text-xl font-bold ${
            allSystemsGreen ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'
          }`}>
            {allSystemsGreen ? 'All Systems Operational' : 'System Degradation Detected'}
          </h2>
        </div>
        {!allSystemsGreen && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            Some systems are offline. Please check system health immediately.
          </p>
        )}
      </div>

      {/* Automation & Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Automation Level */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Automation</h3>
          </div>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{data.automation}%</p>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
              style={{ width: `${data.automation}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {data.tasksAutomated} of {data.tasksTotal} tasks automated
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Target: 95% by 2027</p>
        </div>

        {/* Uptime */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Uptime</h3>
          </div>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">{data.uptime}%</p>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
              style={{ width: `${data.uptime}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Target: 99.9%</p>
        </div>

        {/* Response Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Time</h3>
          </div>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{data.responseTime}ms</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Average API response time</p>
        </div>

        {/* Error Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Rate</h3>
          </div>
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">{data.errorRate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Last 24 hours</p>
        </div>
      </div>
    </div>
  );
}
