import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable sourcemaps for production for better performance and security
    sourcemap: false,
    // Use esbuild for faster minification
    minify: 'esbuild',
    // Adjust the chunk size warning limit (in kB)
    chunkSizeWarningLimit: 600,
  },
  // Optional: Add a server proxy if your FastAPI backend and Vite dev server run on different ports
  // This helps avoid CORS issues during development.
  server: {
    proxy: {
      '/api/klipp': {
        target: 'http://localhost:4002', // Klipp service
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/klipp/, ''),
      },
      '/api/weaver': {
        target: 'http://localhost:4001', // AI Orchestrator (Weaver)
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weaver/, ''),
      },
      '/api/neural': {
        target: 'http://localhost:4005', // Neural Context Engine
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/neural/, ''),
      },
      '/api/retail': {
        target: 'http://localhost:4006', // Retail Partner Integration
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/retail/, ''),
      },
      '/api/coldchain': {
        target: 'http://localhost:4007', // Cold Chain Quantum Engine
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coldchain/, ''),
      },
      '/api/safety': {
        target: 'http://localhost:4008', // Universal Safety Orchestrator
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/safety/, ''),
      },
      '/api/autonomous': {
        target: 'http://localhost:4009', // Autonomous Operations Engine
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/autonomous/, ''),
      },
      '/api': {
        target: 'http://localhost:4000', // Main backend
        changeOrigin: true,
      },
    },
  },
})
