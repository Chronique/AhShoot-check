
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
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
