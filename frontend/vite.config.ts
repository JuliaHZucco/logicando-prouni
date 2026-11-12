import { defineConfig, type Plugin } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const enderecoDaApi = 'http://localhost:5098'

function precarregarFonteDosIcones(): Plugin {
  return {
    name: 'precarregar-fonte-dos-icones',
    transformIndexHtml: {
      order: 'post',
      handler(_html, contexto) {
        const fonte = Object.keys(contexto.bundle ?? {}).find((nome) => /bootstrap-icons.*\.woff2$/.test(nome))
        if (!fonte) return []
        return [
          {
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${fonte}`, crossorigin: '' },
            injectTo: 'head',
          },
        ]
      },
    },
  }
}

function metaTagsDeCompartilhamento(urlPublica: string): Plugin {
  return {
    name: 'meta-tags-de-compartilhamento',
    transformIndexHtml() {
      if (!urlPublica) return []
      const base = urlPublica.replace(/\/+$/, '')
      return [
        { tag: 'meta', attrs: { property: 'og:url', content: `${base}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: `${base}/og-image.png` }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${base}/og-image.png` }, injectTo: 'head' },
      ]
    },
  }
}

export default defineConfig(({ mode }) => {
  const ambiente = loadEnv(mode, process.cwd(), '')
  const urlPublica = process.env.URL_PUBLICA_DO_SITE ?? ambiente.URL_PUBLICA_DO_SITE ?? ''

  return {
    plugins: [react(), precarregarFonteDosIcones(), metaTagsDeCompartilhamento(urlPublica)],
    build: {
      outDir: '../backend/QuizProuni.Api/wwwroot',
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
  }
})
