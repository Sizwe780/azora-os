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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/main-app'),
    },
  },
})