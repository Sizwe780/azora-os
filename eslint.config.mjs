import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.cache/**',
      'ui-overhaul/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/service-worker*.js',
      '**/sw.js',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-redeclare': 'off',
      'no-func-assign': 'warn',
      'no-case-declarations': 'off',
    },
  },
];
