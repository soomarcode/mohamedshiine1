import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-waafi': {
        target: 'https://api.waafipay.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-waafi/, '')
      },
      '/api-edahab': {
        target: 'https://edahab.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-edahab/, '')
      }
    }
  }
})
