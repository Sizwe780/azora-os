import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  css: {
    postcss: './postcss.config.cjs'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core dependencies
          'react-vendor': ['react', 'react-dom'],
          // UI library dependencies
          'ui-vendor': ['lucide-react', 'clsx'],
          // Data fetching and state management
          'data-vendor': ['@tanstack/react-query', 'axios', 'date-fns'],
          // Charts and visualization
          'charts-vendor': ['recharts'],
          // Development utilities
          'dev-vendor': ['react-refresh']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to 1000kb
  }
})