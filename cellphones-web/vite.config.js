// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // ✅ Load đúng file .env / .env.production tùy môi trường
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    define: {
      'process.env': env, // ⚡ Cho phép đọc VITE_API_URL khi build
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // ✅ Giúp import "@/..." hoạt động
      },
    },

    server: {
      host: 'localhost',
      port: 5173,
      cors: true,
      open: true,
    },
  }
})
