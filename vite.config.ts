import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow connections from any host
    strictPort: false,
    allowedHosts: 'all', // This fixes the Replit host blocking issue
    hmr: {
      clientPort: 443, // Use HTTPS port for HMR in cloud environments
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  define: {
    // Fix for some packages that expect process.env
    'process.env': {},
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})