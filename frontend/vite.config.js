import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Configuration pour production sur o2switch
    base: mode === 'production' ? '/' : '/',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Optimisations pour production
    minify: 'terser',
    sourcemap: false,
  },
  // Production configuration
  ...(mode === 'production' && {
    define: {
      global: 'globalThis',
    },
    // API base URL for production (relative to domain)
    base: '/',
  }),
}))
