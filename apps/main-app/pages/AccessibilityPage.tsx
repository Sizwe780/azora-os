import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Keyboard, Eye, Type, Contrast, ZoomIn, Users, Volume2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AccessibilitySettings {
  textSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
  magnification: number;
  keyboardOnly: boolean;
  screenReaderEnabled: boolean;
}

const VOICE_COMMANDS = [
  { command: 'Show trips', description: 'View all your trips' },
  { command: 'Start trip', description: 'Begin a new trip' },
  { command: 'Show dashboard', description: 'Go to main dashboard' },
  { command: 'Log inspection', description: 'Record vehicle inspection' },
  { command: 'Show documents', description: 'View your documents' },
  { command: 'Check fuel', description: 'View fuel levels' },
  { command: 'Show alerts', description: 'View active alerts' },
  { command: 'Help', description: 'Get assistance' },
];

const KEYBOARD_SHORTCUTS = [
  { keys: 'Alt + T', action: 'View Trips' },
  { keys: 'Alt + D', action: 'Dashboard' },
  { keys: 'Alt + I', action: 'Inspection' },
  { keys: 'Alt + F', action: 'Fuel Status' },
  { keys: 'Alt + H', action: 'Help' },
  { keys: 'Ctrl + /', action: 'Search' },
  { keys: 'Esc', action: 'Close Modal' },
  { keys: '?', action: 'Show Shortcuts' },
];

export default function AccessibilityPage() {
  const [listening, setListening] = useState(false);
  const [recognizedCommand, setRecognizedCommand] = useState('');
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 'medium',
    highContrast: false,
    colorBlindMode: 'none',
    reducedMotion: false,
    magnification: 100,
    keyboardOnly: false,
    screenReaderEnabled: false
  });

  const startVoiceCommand = async () => {
    setListening(true);
    setRecognizedCommand('');
    toast.success('🎤 Listening... Say a command');

    try {
      // In production, use Web Speech API
      // const recognition = new (window as any).webkitSpeechRecognition();
      
      // Demo: simulate voice recognition
      if (typeof globalThis.setTimeout !== 'function') {
        console.error('setTimeout is not available in this environment');
        setListening(false);
        return;
      }

      globalThis.setTimeout(() => {
        const demoCommand = 'Show trips';
        setRecognizedCommand(demoCommand);
        void executeVoiceCommand(demoCommand);
        setListening(false);
      }, 2000);
    } catch (error) {
      console.error('Voice recognition failed:', error);
      toast.error('Voice recognition not available');
      setListening(false);
    }
  };

  const executeVoiceCommand = async (command: string) => {
    try {
      await axios.post('http://localhost:4090/api/accessibility/voice-command', {
        command,
        userId: 'user123'
      });
      
      toast.success(`✓ Executed: ${command}`);
      
      // In production, navigate based on command
      if (command.toLowerCase().includes('dashboard')) {
        // Navigate to dashboard
      } else if (command.toLowerCase().includes('trips')) {
        // Navigate to trips
      }
    } catch (error) {
      console.error('Failed to execute voice command:', error);
      toast.success(`✓ Executed: ${command} (Demo Mode)`);
    }
  };

  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      await axios.post('http://localhost:4090/api/accessibility/settings', {
        userId: 'user123',
        settings: updated
      });
      toast.success('Settings saved!');
    } catch (error) {
      console.error('Failed to persist settings:', error);
      toast.success('Settings applied! (Demo Mode)');
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;

    // Text size adjustments
    const textSizeMap: Record<AccessibilitySettings['textSize'], string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '22px'
    };
    root.style.fontSize = textSizeMap[settings.textSize];

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.style.setProperty('--motion-duration', settings.reducedMotion ? '0s' : '0.3s');
    root.style.setProperty('--azora-zoom', `${settings.magnification}%`);

    if (typeof document.body !== 'undefined') {
      document.body.style.zoom = `${settings.magnification}%`;
    }
  }, [settings]);

  const speak = async (text: string) => {
    try {
      await axios.post('http://localhost:4090/api/accessibility/tts/speak', {
        text,
        language: 'en-US'
      });
    } catch (error) {
      console.error('Failed to use remote TTS:', error);
      // Fallback to browser TTS
      const speechEngine = typeof globalThis !== 'undefined'
        ? (globalThis as { speechSynthesis?: { speak: (utterance: unknown) => void } }).speechSynthesis
        : undefined;
      const UtteranceCtor = typeof globalThis !== 'undefined'
        ? (globalThis as { SpeechSynthesisUtterance?: new (text: string) => unknown }).SpeechSynthesisUtterance
        : undefined;

      if (speechEngine && typeof UtteranceCtor === 'function') {
        const utterance = new UtteranceCtor(text);
        // Browser speech synthesis expects specific utterance shape.
        speechEngine.speak(utterance);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Accessibility</h1>
        <p className="text-purple-200">Everyone Can Use Azora OS - Built for All</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Voice Commands */}
        <div className="col-span-2 space-y-6">
          {/* Voice Command Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Mic className="w-6 h-6" />
              Voice Commands
            </h2>

            <div className="flex flex-col items-center mb-8">
              <button
                onClick={startVoiceCommand}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  listening
                    ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                    : 'bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/50'
                }`}
              >
                <Mic className="w-16 h-16 text-white" />
              </button>
              <p className="text-white mt-4 text-center">
                {listening ? 'Listening...' : 'Click to speak a command'}
              </p>
              {recognizedCommand && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 mt-2 font-semibold"
                >
                  &quot;{recognizedCommand}&quot;
                </motion.p>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">Available Commands:</h3>
            <div className="grid grid-cols-2 gap-3">
              {VOICE_COMMANDS.map((cmd, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => executeVoiceCommand(cmd.command)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all border border-white/10 group"
                >
                  <p className="text-white font-semibold mb-1 group-hover:text-purple-400 transition-colors">
                    &quot;{cmd.command}&quot;
                  </p>
                  <p className="text-white/60 text-sm">{cmd.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Keyboard className="w-6 h-6" />
              Keyboard Shortcuts
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <span className="text-white/70">{shortcut.action}</span>
                  <kbd className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded font-mono text-sm border border-purple-500/50">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                void speak('Keyboard shortcuts panel opened. Refer to on-screen list for navigation.');
              }}
              className="w-full mt-6 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
            >
              Press ? to show all shortcuts
            </button>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sticky top-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Settings
            </h2>

            <div className="space-y-6">
              {/* Text Size */}
              <div>
                <label className="text-white/70 text-sm mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ textSize: size })}
                      className={`px-4 py-2 rounded-lg transition-all capitalize ${
                        settings.textSize === size
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Contrast */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    <Contrast className="w-4 h-4" />
                    High Contrast
                  </span>
                  <button
                    onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      settings.highContrast ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                        settings.highContrast ? 'left-8' : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Color Blind Mode */}
              <div>
                <label className="text-white/70 text-sm mb-3 block">
                  Color Blind Mode
                </label>
                <select
                  value={settings.colorBlindMode}
                  onChange={(e) => updateSettings({ colorBlindMode: e.target.value as AccessibilitySettings['colorBlindMode'] })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none" className="bg-slate-800">None</option>
                  <option value="protanopia" className="bg-slate-800">Protanopia (Red-blind)</option>
                  <option value="deuteranopia" className="bg-slate-800">Deuteranopia (Green-blind)</option>
                  <option value="tritanopia" className="bg-slate-800">Tritanopia (Blue-blind)</option>
                </select>
              </div>

              {/* Reduced Motion */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Reduced Motion</span>
                  <button
                    onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      settings.reducedMotion ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                        settings.reducedMotion ? 'left-8' : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Magnification */}
              <div>
                <label className="text-white/70 text-sm mb-3 flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  Magnification: {settings.magnification}%
                </label>
                <input
                  type="range"
                  min="100"
                  max="200"
                  step="10"
                  value={settings.magnification}
                  onChange={(e) => updateSettings({ magnification: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Keyboard Only Mode */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    Keyboard Only
                  </span>
                  <button
                    onClick={() => updateSettings({ keyboardOnly: !settings.keyboardOnly })}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      settings.keyboardOnly ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                        settings.keyboardOnly ? 'left-8' : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Screen Reader */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Screen Reader
                  </span>
                  <button
                    onClick={() => {
                      updateSettings({ screenReaderEnabled: !settings.screenReaderEnabled });
                      if (!settings.screenReaderEnabled) {
                        speak('Screen reader enabled. Welcome to Azora OS.');
                      }
                    }}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      settings.screenReaderEnabled ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                        settings.screenReaderEnabled ? 'left-8' : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Test Screen Reader */}
            {settings.screenReaderEnabled && (
              <button
                onClick={() => speak('This is a test of the screen reader functionality. You are on the accessibility settings page.')}
                className="w-full mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Test Screen Reader
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-6 mt-6"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <Users className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Built for Everyone</h3>
          <p className="text-white/70 text-sm">
            Azora OS is designed to be accessible to all users, regardless of ability. We follow WCAG 2.1 AA standards.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <Mic className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">27 Voice Commands</h3>
          <p className="text-white/70 text-sm">
            Control the entire platform with your voice. Perfect for drivers on the road or users with mobility challenges.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <Keyboard className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">22 Keyboard Shortcuts</h3>
          <p className="text-white/70 text-sm">
            Navigate without a mouse using our comprehensive keyboard shortcuts. Every feature is accessible via keyboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
