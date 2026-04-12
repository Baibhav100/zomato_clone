import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    '__BUNDLED_DEV__': JSON.stringify(true),
    '__SERVER_FORWARD_CONSOLE__': JSON.stringify(true),
  },
  server: {
    port: 3000,
    force: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
