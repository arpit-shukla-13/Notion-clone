// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api' se shuru hone wali sabhi requests ko proxy karega
      '/api': {
        target: 'http://localhost:8000', // Aapka Express server
        changeOrigin: true,
      }
    }
  }
})