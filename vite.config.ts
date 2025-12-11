import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/proxy/openrouter': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/proxy\/openrouter/, '/api/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_OPENROUTER_API_KEY;
              if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`);
              proxyReq.setHeader('HTTP-Referer', 'http://localhost:3000');
              proxyReq.setHeader('X-Title', 'WILI AI Workspace');
            });
          }
        },
        '/proxy/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/proxy\/openai/, '/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_OPENAI_API_KEY;
              if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`);
            });
          }
        },
        '/proxy/hf': {
          target: 'https://api-inference.huggingface.co',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/proxy\/hf/, '/models'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_HF_TOKEN;
              if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`);
            });
          }
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
