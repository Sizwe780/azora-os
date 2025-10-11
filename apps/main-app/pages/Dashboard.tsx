import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

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

export default function Dashboard() {
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
                {mockServiceModules.map((service, idx) => (
                  <ServiceModuleCard key={service.id} {...service} index={idx} />
                ))}
              </div>
            </motion.div>

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
