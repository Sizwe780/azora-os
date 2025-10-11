export type TextSizeType = 'Small' | 'Medium' | 'Large' | 'XL';
export type ColorBlindModeType = 'None' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia';

export interface AccessibilitySettings {
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  textSize: TextSizeType;
  colorBlindMode: ColorBlindModeType;
}

export const getMockAccessibilitySettings = (): AccessibilitySettings => ({
  highContrast: false,
  reduceMotion: false,
  screenReader: true,
  textSize: 'Medium',
  colorBlindMode: 'None',
});

export const VOICE_COMMANDS = [
  'Show dashboard', 'Start new trip', 'Log inspection', 'View documents', 'Check fuel status', 'Show active alerts'
];

export const KEYBOARD_SHORTCUTS = [
  { keys: 'Alt + D', action: 'Dashboard' },
  { keys: 'Alt + T', action: 'View Trips' },
  { keys: 'Alt + I', action: 'Inspection' },
  { keys: '?', action: 'Show Shortcuts' },
];
