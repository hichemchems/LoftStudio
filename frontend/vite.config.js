import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // Optimisations pour mémoire limitée sur o2switch
    rollupOptions: {
      output: {
        manualChunks: () => 'index',
      },
    },
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 0,
    // Désactiver les sourcemaps pour économiser mémoire
    sourcemap: false,
    // Désactiver la minification pour économiser mémoire
    minify: false,
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
