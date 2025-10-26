import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimisations pour mémoire limitée sur o2switch
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Diviser en chunks plus petits
        chunkSizeWarningLimit: 500,
      },
    },
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 500,
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
    // Limiter la mémoire utilisée
    cssCodeSplit: false,
    reportCompressedSize: false,
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
    'process.env': {},
  },
})
