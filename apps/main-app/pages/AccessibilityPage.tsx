import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Type, Eye, Contrast, Volume2, Check } from 'lucide-react';

import { 
  AccessibilitySettings, 
  getMockAccessibilitySettings,
  TextSizeType,
  ColorBlindModeType
} from '../features/accessibility/mockAccessibility';
import SettingToggle from '../components/accessibility/SettingToggle';
import SettingOptions from '../components/accessibility/SettingOptions';
import { VoiceControlCard, KeyboardShortcutsCard } from '../components/accessibility/InteractionCards';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AccessibilityPage() {
  const [settings, setSettings] = useState<AccessibilitySettings | null>(null);

  useEffect(() => {
    setSettings(getMockAccessibilitySettings());
  }, []);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => prev ? ({ ...prev, [key]: !prev[key as keyof typeof prev] }) : null);
  };

  const selectSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => prev ? ({ ...prev, [key]: value }) : null);
  };

  if (!settings) {
    return <div className="flex items-center justify-center h-full"><Users className="w-16 h-16 text-purple-400 animate-spin" /></div>;
  }

  return (
    <motion.div 
      className="p-6 bg-gray-950 text-white space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Users className="w-10 h-10 text-purple-400" />
        <div>
          <h1 className="text-4xl font-bold text-white">Accessibility</h1>
          <p className="text-purple-300">Azora OS is designed and built for everyone.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white">Display & Motion</h3>
            <SettingOptions<TextSizeType>
              icon={Type}
              title="Text Size"
              options={['Small', 'Medium', 'Large', 'XL']}
              selected={settings.textSize}
              onSelect={(value) => selectSetting('textSize', value)}
            />
            <SettingOptions<ColorBlindModeType>
              icon={Eye}
              title="Color Vision"
              options={['None', 'Protanopia', 'Deuteranopia', 'Tritanopia']}
              selected={settings.colorBlindMode}
              onSelect={(value) => selectSetting('colorBlindMode', value)}
            />
            <SettingToggle icon={Contrast} title="High Contrast Mode" enabled={settings.highContrast} onToggle={() => toggleSetting('highContrast')} />
            <SettingToggle icon={motion.div} title="Reduced Motion" enabled={settings.reduceMotion} onToggle={() => toggleSetting('reduceMotion')} />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Interaction</h3>
            <SettingToggle icon={Volume2} title="Screen Reader" enabled={settings.screenReader} onToggle={() => toggleSetting('screenReader')} />
            {settings.screenReader && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="pl-10 mt-2 text-sm text-green-400 flex items-center gap-2">
                <Check size={16}/> Screen Reader is active. All interactions will be announced.
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div variants={itemVariants}>
            <VoiceControlCard />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KeyboardShortcutsCard />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
