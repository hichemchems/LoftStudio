import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimisations pour mémoire limitée
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 1000,
    // Désactiver les sourcemaps pour économiser mémoire
    sourcemap: false,
    // Optimisations supplémentaires
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimisations pour le développement
  server: {
    host: true,
    port: 5173,
  },
  // Variables d'environnement
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
