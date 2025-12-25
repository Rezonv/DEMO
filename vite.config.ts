import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Using the new key provided by 学长!
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || 'AIzaSyBXPSo5UUukXzpghH1i3EHV4POUCCrinfc';

  // Debug log to help 学长 troubleshoot!
  if (apiKey) {
    console.log('\x1b[32m%s\x1b[0m', '✨ [幻夢伴侶] API Key found! Configuration is looking good! ✨');
  } else {
    console.log('\x1b[31m%s\x1b[0m', '💔 [幻夢伴侶] API Key missing! Please check .env.local for GEMINI_API_KEY or VITE_GEMINI_API_KEY');
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/runpod-proxy': {
          target: 'https://api.runpod.ai/v2/nu12bv9gmixm0v',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/runpod-proxy/, ''),
          secure: false,
          timeout: 600000, // 10 Minutes (For 72B Model)
          proxyTimeout: 600000 // 10 Minutes
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.RUNPOD_API_KEY': JSON.stringify(env.RUNPOD_API_KEY || env.VITE_RUNPOD_API_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
