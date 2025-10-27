import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // ✅ Load đúng file .env.production khi build
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'process.env': env, // ⚡ Bắt buộc để build đọc VITE_API_URL
    },
    server: {
      host: 'localhost',
      port: 5173,
      cors: true,
      open: true,
    },
  }
})
