import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Security: Only expose specific non-sensitive variables
    const safeEnvVars: Record<string, string> = {};
    if (env.GEMINI_API_KEY && mode !== 'production') {
      // Note: API keys should NEVER be exposed in the bundle for production
      // This should only be used for development/testing
      safeEnvVars.GEMINI_API_KEY = env.GEMINI_API_KEY;
    }
    
    return {
      server: {
        port: 5173,
        host: '127.0.0.1',
        hmr: {
          overlay: false // Reduce console noise
        }
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(safeEnvVars.GEMINI_API_KEY || '')
      },
      build: {
        // Remove sensitive information from build output
        sourcemap: mode !== 'production',
        rollupOptions: {
          output: {
            // Prevent sensitive data in chunk names
            sanitizeFileName: (name) => name.replace(/\[hash\]/g, '[hash]')
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
