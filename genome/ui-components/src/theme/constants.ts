/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export const colors = {
  primary: {
    50: '#e6f7ff',
    100: '#bae3ff',
    200: '#7cc4fa',
    300: '#47a3f3',
    400: '#2186eb',
    500: '#0967d2',
    600: '#0552b5',
    700: '#03449e',
    800: '#01337d',
    900: '#002159',
  },
  secondary: {
    50: '#f5f7ff',
    100: '#ebf0ff',
    200: '#d6e0ff',
    300: '#a6c1ff',
    400: '#598bff',
    500: '#3366ff',
    600: '#274bdb',
    700: '#1a34b8',
    800: '#102694',
    900: '#091c7a',
  },
  success: {
    50: '#e3fcec',
    100: '#abf5ce',
    200: '#5ae9a8',
    300: '#1cd98a',
    400: '#00d68f',
    500: '#00b887',
    600: '#00997a',
    700: '#007d6c',
    800: '#004a42',
    900: '#002b20',
  },
  warning: {
    50: '#fff8e6',
    100: '#ffefc1',
    200: '#ffe59a',
    300: '#ffd465',
    400: '#ffbe3d',
    500: '#ffa91c',
    600: '#db8b00',
    700: '#b86e00',
    800: '#945400',
    900: '#703c00',
  },
  danger: {
    50: '#ffe8e8',
    100: '#ffc1c1',
    200: '#ff9a9a',
    300: '#ff6565',
    400: '#ff3d3d',
    500: '#ff1c1c',
    600: '#db0000',
    700: '#b80000',
    800: '#940000',
    900: '#700000',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
};

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const spacing = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
};

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto',
};

export const transitions = {
  default: 'all 0.2s ease-in-out',
  fast: 'all 0.1s ease-in-out',
  slow: 'all 0.3s ease-in-out',
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
};
