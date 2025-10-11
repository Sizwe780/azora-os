import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Lock, Palette } from 'lucide-react';

import { SettingsData, getMockSettingsData } from '../features/settings/mockSettings';
import ProfilePanel from '../components/settings/ProfilePanel';
import SettingsSection from '../components/settings/SettingsSection';
import { Toggle, Select, NumberInput } from '../components/settings/FormControls';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    setSettings(getMockSettingsData());
  }, []);

  const handleSettingChange = (category: keyof SettingsData, key: any, value: any) => {
    if (!settings) return;
    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [key]: value,
      }
    }));
  };

  if (!settings) {
    return <div className="flex items-center justify-center h-full"><SettingsIcon className="w-16 h-16 text-purple-400 animate-spin" /></div>;
  }

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
          <SettingsIcon className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Settings</h1>
            <p className="text-cyan-300">Configure your Azora OS experience</p>
          </div>
        </div>
      </motion.div>

      {/* Profile */}
      <motion.div variants={itemVariants}>
        <ProfilePanel profile={settings.profile} />
      </motion.div>

      {/* Settings Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={itemVariants}
      >
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Manage how Aura communicates with you"
          color="purple"
        >
          <Select 
            label="Critical Alerts"
            value={settings.notifications.criticalAlerts}
            onChange={(v) => handleSettingChange('notifications', 'criticalAlerts', v)}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'push', label: 'Push Notification' },
            ]}
          />
          <Select 
            label="System Updates"
            value={settings.notifications.systemUpdates}
            onChange={(v) => handleSettingChange('notifications', 'systemUpdates', v)}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'push', label: 'Push Notification' },
              { value: 'none', label: 'None' },
            ]}
          />
          <Toggle 
            label="Daily Briefing"
            enabled={settings.notifications.dailyBriefing}
            onChange={(v) => handleSettingChange('notifications', 'dailyBriefing', v)}
          />
        </SettingsSection>

        <SettingsSection
          icon={Lock}
          title="Privacy & Security"
          description="Control your data and security settings"
          color="green"
        >
          <Toggle 
            label="Two-Factor Authentication"
            enabled={settings.security.twoFactorAuth}
            onChange={(v) => handleSettingChange('security', 'twoFactorAuth', v)}
          />
          <NumberInput
            label="Session Timeout"
            value={settings.security.sessionTimeout}
            onChange={(v) => handleSettingChange('security', 'sessionTimeout', v)}
            unit="minutes"
          />
          <Select 
            label="Data Encryption"
            value={settings.security.dataEncryption}
            onChange={(v) => handleSettingChange('security', 'dataEncryption', v)}
            options={[
              { value: 'AES-256', label: 'AES-256' },
              { value: 'Quantum-Resistant', label: 'Quantum-Resistant' },
            ]}
          />
        </SettingsSection>

        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Customize the look and feel of the interface"
          color="yellow"
        >
          <Select 
            label="Theme"
            value={settings.appearance.theme}
            onChange={(v) => handleSettingChange('appearance', 'theme', v)}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
              { value: 'system', label: 'System Default' },
            ]}
          />
          <Select 
            label="UI Density"
            value={settings.appearance.density}
            onChange={(v) => handleSettingChange('appearance', 'density', v)}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Comfortable' },
            ]}
          />
        </SettingsSection>
      </motion.div>
      
      <motion.div variants={itemVariants} className="flex justify-end pt-4">
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors">
          Save Changes
        </button>
      </motion.div>

    </motion.div>
  );
}
