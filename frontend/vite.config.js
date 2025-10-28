import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // Optimisations pour mémoire limitée sur o2switch
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['axios', 'socket.io-client', 'chart.js', 'react-chartjs-2']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: false,
    sourcemap: false
  },
  // Optimisations pour le développement
  server: {
    host: true,
    port: 5173,
  },
  // Variables d'environnement
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || 'production'),
    global: 'globalThis',
  },
})
