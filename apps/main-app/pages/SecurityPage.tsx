import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity } from 'lucide-react';
import { SecurityData, getMockSecurityData } from '../features/security/mockSecurity';
import OverallStatus from '../components/security/OverallStatus';
import SecurityLayersPanel from '../components/security/SecurityLayersPanel';
import AlarmsPanel from '../components/security/AlarmsPanel';
import SystemStatusPanel from '../components/security/SystemStatusPanel';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { stiffness: 100 } },
};

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);

  useEffect(() => {
    setData(getMockSecurityData());
    
    const interval = setInterval(() => {
      // In a real app, you'd fetch new data here.
      // For this mock, we can just re-set it to simulate updates.
      setData(getMockSecurityData());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-full"><Activity className="w-16 h-16 text-purple-400 animate-spin" /></div>;
  }

  const allLayersGreen = data.layers.every(layer => layer.status === 'active');
  const criticalAlarmsCount = data.alarms.filter(alarm => alarm.severity === 'critical' && !alarm.resolved).length;

  return (
    <motion.div 
      className="p-6 bg-gray-950 text-white space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4">
          <Shield className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Security Command</h1>
            <p className="text-cyan-300">Real-time Threat Analysis & System Integrity</p>
          </div>
        </div>
      </motion.div>

      {/* Overall Status */}
      <motion.div variants={itemVariants}>
        <OverallStatus allLayersGreen={allLayersGreen} criticalAlarmsCount={criticalAlarmsCount} />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <SecurityLayersPanel layers={data.layers} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AlarmsPanel alarms={data.alarms} />
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants}>
        <SystemStatusPanel health={data.systemHealth} backup={data.backupStatus} />
      </motion.div>

    </motion.div>
  );
}
