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
      '/api': {
        target: 'http://127.0.0.1:8000', // Your FastAPI backend URL
        changeOrigin: true,
      },
    },
  },
})
