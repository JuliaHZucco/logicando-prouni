import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const enderecoDaApi = 'http://localhost:5098'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../backend/QuizProuni.Api/wwwroot",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': enderecoDaApi,
      '/hubs': { target: enderecoDaApi, ws: true },
    },
  },
})
