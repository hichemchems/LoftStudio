import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Memory-efficient build options for o2switch
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Disable code splitting to reduce memory usage
        inlineDynamicImports: true,
      },
      // Limit concurrent workers to reduce memory
      maxParallelFileOps: 2,
    },
    chunkSizeWarningLimit: 1000,
    // Disable minification for faster builds with less memory
    minify: false,
    sourcemap: false,
    // Reduce target to ES2017 for smaller bundles
    target: 'es2017',
    // Disable CSS code splitting
    cssCodeSplit: false,
    // Limit chunk size
    assetsInlineLimit: 4096,
    // Optimize build performance
    reportCompressedSize: false,
    // Disable terser for memory constraints
    terserOptions: {
      compress: false,
      mangle: false,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Disable pre-bundling for memory efficiency
    disabled: true,
  },
  // Disable esbuild for better memory usage
  esbuild: false,
  // Server config for development
  server: {
    fs: {
      // Allow serving files from packages
      allow: ['../../']
    }
  },
})
