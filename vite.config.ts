
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use path.resolve('.') instead of process.cwd() to avoid TS error if Node types are missing
  const env = loadEnv(mode, path.resolve('.'), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        // Externalize modules that are provided via importmap in index.html
        external: [
          'react',
          'react-dom',
          'react-dom/client',
          '@google/genai',
          'ethers',
          'viem',
          'wagmi',
          '@coinbase/onchainkit',
          'clsx',
          'tailwind-merge',
          'react-markdown',
          'lucide-react',
          '@farcaster/quick-auth',
          '@farcaster/miniapp-sdk'
        ]
      }
    },
    // Shim process.env untuk kompatibilitas dengan code Next.js/library lama
    define: {
      'process.env.NEXT_PUBLIC_URL': JSON.stringify(env.NEXT_PUBLIC_URL),
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.VERCEL_ENV': JSON.stringify(env.VERCEL_ENV),
    },
    server: {
      port: 3000,
    }
  };
});
