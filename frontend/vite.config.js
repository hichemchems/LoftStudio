import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Documentation Vite: https://vitejs.dev/config/
export default defineConfig({
  // IMPORTANT: 'base' est retiré ou laissé par défaut ('/') car le Frontend
  // est désormais déployé à la racine du domaine (public_html), comme recommandé par o2switch.
  plugins: [react()],
  build: {
    // Optimisations pour mémoire limitée sur o2switch (build local)
    rollupOptions: {
      output: {
        // Découpage manuel des 'chunks' pour éviter les gros fichiers
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          // Grouper les grosses librairies ensemble
          ui: ['axios', 'socket.io-client', 'chart.js', 'react-chartjs-2']
        }
      }
    },
    // Fixe la limite d'avertissement de taille de chunk à 1000 KB
    chunkSizeWarningLimit: 1000,
    // La minification et le sourcemap sont désactivés pour la rapidité du build
    minify: false,
    sourcemap: false
  },
  // Optimisations pour le développement local
  server: {
    host: true,
    port: 5173,
  },
  // Variables d'environnement pour l'application
  define: {
    __APP_ENV__: '"production"',
    global: 'globalThis', // Fixe les problèmes de polyfill Node.js dans le navigateur
  },
})