import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import mkcert from 'vite-plugin-mkcert'

import path from "path";

export default ({mode}) => {
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
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
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
    ]
  })
}
