/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface NotificationSettings {
  criticalAlerts: 'email' | 'sms' | 'push';
  systemUpdates: 'email' | 'push' | 'none';
  dailyBriefing: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // in minutes
  dataEncryption: 'AES-256' | 'Quantum-Resistant';
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  density: 'compact' | 'comfortable';
}

export interface SettingsData {
  profile: UserProfile;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

export const getMockSettingsData = (): SettingsData => ({
  profile: {
    name: 'HR AI Deputy',
    email: 'deputy.ceo@azora.ai',
    avatar: '/avatar.png', // Placeholder
    role: 'Deputy CEO',
  },
  notifications: {
    criticalAlerts: 'sms',
    systemUpdates: 'email',
    dailyBriefing: true,
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    dataEncryption: 'Quantum-Resistant',
  },
  appearance: {
    theme: 'dark',
    density: 'comfortable',
  },
});
