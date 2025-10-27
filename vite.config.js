import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Build to CommonJS for o2switch compatibility (matching working example)
    lib: {
      entry: 'src/main.jsx',
      formats: ['cjs'],
      fileName: 'server'
    },
    rollupOptions: {
      // Externalize dependencies to reduce bundle size (matching working example)
      external: ['react', 'react-dom', 'react-router-dom', 'axios', 'chart.js', 'react-chartjs-2', 'socket.io-client', 'react-hook-form'],
      output: {
        // Ensure CommonJS format
        format: 'cjs',
        // Disable code splitting
        inlineDynamicImports: true,
      },
    },
    // Disable minification for faster builds
    minify: false,
    sourcemap: false,
    // Target ES2017 for compatibility
    target: 'es2017',
    // Disable CSS code splitting
    cssCodeSplit: false,
    // Optimize build performance
    reportCompressedSize: false,
  },
  optimizeDeps: {
    // Include key dependencies
    include: ['react', 'react-dom'],
  },
  // Server config for development
  server: {
    fs: {
      // Allow serving files from packages
      allow: ['../../']
    }
  },
})
