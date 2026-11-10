import { defineConfig } from 'vitest/config'
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
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testes/configuracao.ts'],
    css: false,
  },
})
