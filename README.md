# Feevale Prouni

App web (React + TypeScript + Bootstrap) para tirar dúvidas sobre o PROUNI — Universidade Feevale.

Sem backend: todo o conteúdo fica em `src/funcionalidades/duvidas/dados/conteudo.ts` (categorias e dúvidas), sem banco de dados nem login.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

Organização por **funcionalidade** (feature folder), não só por tipo de arquivo — cada funcionalidade concentra seus próprios tipos, dados, contexto/hooks e componentes específicos. Isso facilita adicionar novas funcionalidades (como o quiz) sem misturar código de domínios diferentes.

```
src/
├── App.tsx / main.tsx / index.css   → entrada e configuração do framework (convenção Vite/React, em inglês)
├── layout/                          → moldura fixa do app (sempre visível)
│   ├── Cabecalho.tsx
│   └── Rodape.tsx
├── componentes/                     → componentes genéricos, reaproveitáveis por qualquer funcionalidade
│   └── BarraProgresso.tsx
├── funcionalidades/
│   └── duvidas/                     → tudo específico da funcionalidade "dúvidas do PROUNI"
│       ├── tipos.ts
│       ├── dados/conteudo.ts
│       ├── contexto/ContextoVisualizacoes.tsx   → Provider (componente)
│       ├── hooks/useVisualizacoes.ts            → hook (separado do Provider)
│       ├── AcordeaoDuvidas.tsx
│       └── ChamadaQuiz.tsx
└── paginas/                         → telas de rota, montam layout + componentes + funcionalidades
    ├── Inicio.tsx
    ├── PaginaCategoria.tsx
    └── ResultadoBusca.tsx
```

Quando o quiz for desenvolvido, a expectativa é criar `src/funcionalidades/quiz/` com a mesma organização interna (tipos, dados, contexto/hooks se precisar, componentes), sem tocar em `funcionalidades/duvidas/`.

## Padrão de nomenclatura

- Componentes e páginas: `PascalCase` em português (`Cabecalho`, `PaginaCategoria`)
- Campos, variáveis e props: `camelCase` em português, **sempre prefixados com o nome da entidade dona do dado** (padrão Entidade+Campo, igual ao usado no CaixaDigital, ex. `PagamentoFormaID`) — nunca um nome genérico solto como `nome` ou `resposta`:
  - `Categoria`: `categoriaId`, `categoriaNome`, `categoriaDescricao`, `categoriaIcone`, `categoriaDuvidas`
  - `ItemDuvida`: `duvidaId`, `duvidaPergunta`, `duvidaResposta`
  - Contexto de progresso: `duvidaIdsVistas`, `marcarDuvidaComoVista`, `totalDuvidasVistas`, `totalGeralDuvidas`, `contarDuvidasVistasNaCategoria`
  - Componente de busca: `termoBusca`, `termoBuscaNormalizado`, `duvidasEncontradas`, `duvidaCategoriaNome`
- Classes CSS: `kebab-case` em português, seguindo o mesmo padrão Entidade-Campo (`card-categoria`, `duvida-pergunta`, `duvida-resposta`, `chamada-quiz-icone`), organizadas por seção no `index.css`. Termos técnicos de UI (`card`, `form`, `container`) ficam em inglês por serem vocabulário do próprio front-end, não do domínio PROUNI

## Quiz

O card "Quiz do PROUNI" na Início e na página de categoria (`ChamadaQuiz.tsx`) é só um teaser, sem funcionalidade ainda — é o espaço reservado para quando o quiz for desenvolvido.
