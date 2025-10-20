import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  mockStats,
  mockServiceModules,
  mockQuickActions,
  mockRecentActivity,
} from '../features/dashboard/mockDashboardData';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import ServiceModuleCard from '../components/dashboard/ServiceModuleCard';
import QuickActionButton from '../components/dashboard/QuickActionButton';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import SecurityMonitoringPanel from '../components/SecurityMonitoringPanel';

const servicePorts: Record<string, number> = {
  'azora-coin': 3001,
  'compliance': 4120,
  'salezora': 5400,
  'marketplace': 4130,
  'notification': 5300,
  'quantum-ai': 4001,
  'fleet-command': 4002,
  'cold-chain': 4007,
  'universal-safety': 4008,
  'hr-deputy': 4003,
  'doc-vault': 4004,
};

export default function Dashboard({ userId }: { userId: string }) {
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, 'operational' | 'degraded' | 'maintenance'>>({});

  useEffect(() => {
    const checkHealth = async () => {
      const statuses: Record<string, 'operational' | 'degraded' | 'maintenance'> = {};
      for (const [id, port] of Object.entries(servicePorts)) {
        try {
          const response = await fetch(`http://localhost:${port}/health`);
          if (response.ok) {
            statuses[id] = 'operational';
          } else {
            statuses[id] = 'degraded';
          }
        } catch {
          statuses[id] = 'maintenance';
        }
      }
      setServiceStatuses(statuses);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const servicesWithStatus = mockServiceModules.map(service => ({
    ...service,
    status: serviceStatuses[service.id] || service.status,
  }));

  console.log('Dashboard loaded for user:', userId);
  return (
    <>
      <Helmet>
        <title>Azora Command Center</title>
        <meta name="description" content="The central nervous system of your autonomous enterprise. Monitor, manage, and command all AI services from one unified dashboard." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-950 min-h-screen text-white">
        <DashboardHeader />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat, idx) => (
            <StatCard key={stat.id} {...stat} index={idx} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Services & Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Bot className="text-cyan-400" />
                <span>Service Modules</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {servicesWithStatus.map((service, idx) => (
                  <ServiceModuleCard key={service.id} {...service} index={idx} />
                ))}
              </div>
            </motion.div>

            {/* Security Monitoring */}
            <SecurityMonitoringPanel />

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockQuickActions.map((action, idx) => (
                  <QuickActionButton key={action.id} {...action} index={idx} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Activity Feed */}
          <div className="lg:col-span-1">
            <RecentActivityFeed activities={mockRecentActivity} />
          </div>
        </div>
      </div>
    </>
  );
}
