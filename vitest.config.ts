/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './apps/main-app/test/setup.ts',
    include: ['apps/main-app/test/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['shield_service/**', 'services/**', 'backend/**', 'quantum_microservice/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'apps/main-app/test/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        'apps/main-app/src/main.tsx',
        'apps/main-app/src/vite-env.d.ts',
        'services/**',
        'backend/**',
        'quantum_microservice/**',
        'shield_service/**',
        'infra/**',
        'docs/**',
        'prisma/**',
        'packages/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        './apps/main-app/src/components/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './apps/main-app/src/pages/': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/main-app'),
    },
  },
})