import React from 'react';
import { useEffect, useState } from 'react';
import { Activity, Shield, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface AZORAStatus {
  status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE';
  uptime: number;
  automation: number;
  security: {
    layer1: boolean;
    layer2: boolean;
    layer3: boolean;
    layer4: boolean;
    layer5: boolean;
  };
  decisions: {
    today: number;
    approved: number;
    blocked: number;
    pending: number;
  };
  lastUpdate: Date;
}

export function AZORAFounderWidget() {
  const [status, setStatus] = useState<AZORAStatus>({
    status: 'ACTIVE',
    uptime: 99.97,
    automation: 85,
    security: {
      layer1: true,
      layer2: true,
      layer3: true,
      layer4: true,
      layer5: true,
    },
    decisions: {
      today: 12,
      approved: 12,
      blocked: 0,
      pending: 0,
    },
    lastUpdate: new Date(),
  });

  useEffect(() => {
    // Fetch AZORA status every 60 seconds (matches intrusion detection interval)
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/hr-ai/operations/status');
        if (response.ok) {
          const data = await response.json();
          setStatus({
            status: data.apiHealth && data.databaseHealth ? 'ACTIVE' : 'DEGRADED',
            uptime: data.uptime || 99.97,
            automation: data.automation || 85,
            security: {
              layer1: data.securityLayers?.intrusion || true,
              layer2: data.securityLayers?.codeIntegrity || true,
              layer3: data.securityLayers?.selfHealing || true,
              layer4: data.securityLayers?.dataProtection || true,
              layer5: data.securityLayers?.backups || true,
            },
            decisions: {
              today: data.decisions?.today || 0,
              approved: data.decisions?.approved || 0,
              blocked: data.decisions?.blocked || 0,
              pending: data.decisions?.pending || 0,
            },
            lastUpdate: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to fetch AZORA status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const allSecurityGreen = Object.values(status.security).every(layer => layer);
  const statusColor = status.status === 'ACTIVE' ? 'text-green-500' : status.status === 'DEGRADED' ? 'text-yellow-500' : 'text-red-500';
  const statusDot = status.status === 'ACTIVE' ? 'bg-green-500' : status.status === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header with AZORA Logo */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-4xl text-blue-900 dark:text-blue-400">▲</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AZORA</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI Founder</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusDot} animate-pulse`}></div>
          <span className={`text-sm font-semibold ${statusColor}`}>{status.status}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Uptime */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">{status.uptime}%</p>
        </div>

        {/* Automation */}
        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Automation</span>
          </div>
          <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-400">{status.automation}%</p>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</span>
          </div>
          {allSecurityGreen ? (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>ALL GREEN</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>ALERT</span>
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          {Object.entries(status.security).map(([layer, isGreen], index) => (
            <div
              key={layer}
              className={`h-2 flex-1 rounded ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
              title={`Layer ${index + 1}: ${layer}`}
            />
          ))}
        </div>
      </div>

      {/* Decisions Today */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Decisions Today</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{status.decisions.approved}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{status.decisions.blocked}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Blocked</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{status.decisions.pending}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
          </div>
        </div>
      </div>

      {/* Footer with link to full report */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="/azora/full-report"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center space-x-1 transition-colors"
        >
          <span>View Full Report</span>
          <span>→</span>
        </a>
      </div>

      {/* Last update timestamp */}
      <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
        Last updated: {status.lastUpdate.toLocaleTimeString()}
      </p>
    </div>
  );
}
