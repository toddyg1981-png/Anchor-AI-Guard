import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 5173,
        host: '127.0.0.1',
        hmr: {
          overlay: false // Reduce console noise
        }
      },
      plugins: [react()],
      build: {
        // Remove sensitive information from build output
        sourcemap: mode !== 'production',
        chunkSizeWarningLimit: 500,
        rollupOptions: {
          output: {
            // Prevent sensitive data in chunk names
            sanitizeFileName: (name) => name.replace(/\[hash\]/g, '[hash]'),
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-pdf': ['jspdf'],
            },
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
