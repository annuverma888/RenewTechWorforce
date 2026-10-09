import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Heavy 3D graphics & WebGL
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            // QR Code scanning and generation
            if (id.includes('html5-qrcode') || id.includes('qrcode.react')) {
              return 'vendor-qrcode';
            }
            // Charting / Analytics
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Firebase authentication and SDK
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Micro-animation library
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Icon system
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Localization framework
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // Core React framework & client routing
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('react-router') ||
              id.includes('@remix-run') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
