import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 개발 중 /api 요청은 로컬 Spring(service)으로 넘긴다
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
