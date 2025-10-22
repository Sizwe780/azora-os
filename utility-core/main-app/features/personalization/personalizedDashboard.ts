/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// features/personalization/personalizedDashboard.ts
// Hyper-personalized dashboard logic for Azora OS

export interface UserProfile {
  userId: string;
  preferences: Record<string, unknown>;
  role: string;
}

export function getPersonalizedWidgets(profile: UserProfile): string[] {
  // Simulate widget selection based on user role and preferences
  if (profile.role === 'admin') return ['Ledger', 'Fleet', 'Compliance', 'AI Insights'];
  if (profile.role === 'driver') return ['TripTracking', 'Schedule', 'VoiceAssistant'];
  return ['Dashboard', 'Support', 'Settings'];
}
