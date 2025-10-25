import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['chart.js', 'react-chartjs-2', 'react-hook-form'],
          utils: ['axios', 'socket.io-client'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: false,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
