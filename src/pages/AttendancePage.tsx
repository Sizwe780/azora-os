import React from 'react';
import { useEffect, useState } from 'react';
import { GitCommit, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface EmployeePerformance {
  id: string;
  name: string;
  commits: number;
  prs: number;
  tasks: number;
  features: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
  anomalies: string[];
}

interface AttendanceData {
  topPerformers: EmployeePerformance[];
  bottomPerformers: EmployeePerformance[];
  teamAverage: number;
  anomalies: {
    employeeId: string;
    employeeName: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/hr-ai/attendance/team');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
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
          <p className="text-red-600 dark:text-red-400">Failed to load attendance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deliverable-Based Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track performance by commits, PRs, tasks, and features delivered</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Team Average</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-400">{data.teamAverage.toFixed(1)}</p>
        </div>
      </div>

      {/* Anomalies Alert */}
      {data.anomalies.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-400">Anomalies Detected</h3>
          </div>
          <div className="space-y-2">
            {data.anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  anomaly.severity === 'high' ? 'bg-red-500' :
                  anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{anomaly.employeeName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{anomaly.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span>Top Performers</span>
        </h2>
        <div className="space-y-4">
          {data.topPerformers.map((employee, index) => (
            <div key={employee.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">#{index + 1}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{employee.name}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span><GitCommit className="w-3 h-3 inline" /> {employee.commits} commits</span>
                    <span>📝 {employee.prs} PRs</span>
                    <span>✅ {employee.tasks} tasks</span>
                    <span>🚀 {employee.features} features</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{employee.score}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-red-500" />
          <span>Needs Attention</span>
        </h2>
        <div className="space-y-4">
          {data.bottomPerformers.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-2xl text-red-600 dark:text-red-400">⚠️</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{employee.name}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span><GitCommit className="w-3 h-3 inline" /> {employee.commits} commits</span>
                    <span>📝 {employee.prs} PRs</span>
                    <span>✅ {employee.tasks} tasks</span>
                    <span>🚀 {employee.features} features</span>
                  </div>
                  {employee.anomalies.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {employee.anomalies.map((anomaly, idx) => (
                        <p key={idx} className="text-xs text-red-600 dark:text-red-400">{anomaly}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{employee.score}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
