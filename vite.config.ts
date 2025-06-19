import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mkcert from 'vite-plugin-mkcert';
import path from "path";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    server: {
      https: true,
      cors: true,
      strictPort: true,
      port: 3000,
      hmr: {
        protocol: 'wss',
        host: 'localhost'
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    define: {
      'process.env': env
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src')
        }
      ],
    },
    plugins: [
      react(),
      mkcert(),
      svgr({
        exportAsDefault: true,
      }),
    ],
    build: {
      target: 'esnext'
    }
  });
};