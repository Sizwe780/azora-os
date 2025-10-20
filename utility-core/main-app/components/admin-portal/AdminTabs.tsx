import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Users, LayoutDashboard, LucideIcon } from 'lucide-react';

interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon: Icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-300 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        isActive
          ? 'text-white'
          : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="active-admin-tab"
          className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className="w-5 h-5 z-10" />
      <span className="z-10">{label}</span>
    </button>
  );
};

interface AdminTabsProps {
  activeTab: 'email' | 'users' | 'dashboard';
  setActiveTab: (tab: 'email' | 'users' | 'dashboard') => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'email', label: 'Email Center', icon: Mail },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  return (
    <motion.div 
      className="flex gap-4 mb-6 p-2 bg-gray-900/50 border border-gray-700/50 rounded-xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id as 'email' | 'users' | 'dashboard')}
        />
      ))}
    </motion.div>
  );
};

export default AdminTabs;
