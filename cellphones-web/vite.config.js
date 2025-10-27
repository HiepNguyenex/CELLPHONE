import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Bản chuẩn cho build Vercel (đọc được .env.production)
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    cors: true,
    open: true,
  },
  define: {
    'process.env': process.env, // ⚡ Bắt buộc để Vercel load env
  },
})
