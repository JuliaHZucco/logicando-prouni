# Feevale Prouni

Aplicação web em React, TypeScript e Bootstrap para apresentar informações sobre o PROUNI da Universidade Feevale, organizar dúvidas por categoria, permitir buscas e oferecer um quiz interativo.

## Executando localmente

```bash
npm install
npm run dev
```

## Validando e gerando a versão de produção

```bash
npm run lint
npm run build
npm run preview
```

O comando `npm run lint` verifica o código com Oxlint. O comando `npm run build` executa a verificação de tipos com TypeScript e gera os arquivos finais na pasta `dist`.

## Fluxo da aplicação

### Página inicial

A rota `/` apresenta a introdução do projeto, o mascote Fê, as categorias de dúvidas e o progresso de leitura do usuário. Cada categoria mostra quantas dúvidas já foram abertas no navegador atual.

### Categorias

A rota `/categoria/:categoriaId` exibe as dúvidas da categoria selecionada. As perguntas são organizadas no componente `AcordeaoDuvidas`. Quando uma dúvida é aberta, seu `duvidaId` é registrado como visualizado em um cookie com duração de um ano.

### Busca

A rota `/buscar?q=termo` pesquisa o termo informado nas perguntas e respostas de todas as categorias. A busca ignora diferenças entre letras maiúsculas, minúsculas e acentos.

### Quiz

A rota `/quiz` apresenta o menu de configuração. O usuário pode escolher entre três modos:

1. Modo aleatório, com perguntas de qualquer categoria.
2. Uma categoria, com perguntas filtradas pela categoria escolhida.
3. Misto, com perguntas das categorias selecionadas. Nesse modo, o mínimo de perguntas é igual ao número de categorias selecionadas, garantindo pelo menos uma pergunta de cada categoria.

O usuário escolhe entre 1 e 10 perguntas. A rota `/quiz/jogar` recebe a configuração pela navegação do React Router, embaralha as perguntas e as alternativas, mostra o feedback de cada resposta e apresenta o resultado ao final.

Ao iniciar novamente o quiz, a mesma seleção de perguntas é reaproveitada para permitir uma nova tentativa. Para voltar ao menu e montar uma nova seleção, o usuário deve usar o botão de voltar ao menu.

## Histórico do quiz

O quiz registra cada resposta no `localStorage` do navegador, sem backend, banco de dados ou login. O identificador da pergunta é o `duvidaId`, inclusive para as perguntas derivadas que possuem identificadores próprios.

A chave usada no navegador é:

```text
feevale-prouni-quiz-historico
```

O valor armazenado possui este formato:

```json
{
  "eleg-1": {
    "acertos": 3,
    "erros": 1
  }
}
```

O histórico não aparece para o usuário na interface, conforme definido para este projeto. Para o professor ou responsável verificar os dados, é possível abrir as ferramentas de desenvolvedor do navegador, acessar a aba Application ou Armazenamento, selecionar Local Storage, escolher o endereço da aplicação e consultar a chave `feevale-prouni-quiz-historico`.

Esse histórico fica disponível até que os dados do site sejam apagados, o perfil do navegador seja removido ou o usuário troque de navegador ou dispositivo.

## Estrutura do código

```text
src/
├── App.tsx e main.tsx             Entrada, rotas e configuração da aplicação
├── index.css                      Estilos globais
├── layout/                        Cabeçalho e rodapé fixos
├── componentes/                  Componentes reutilizáveis
├── funcionalidades/duvidas/
│   ├── tipos.ts                   Tipos das dúvidas e alternativas
│   ├── dados/conteudo.ts          Categorias, perguntas e respostas
│   ├── dados/alternativasQuiz.ts  Alternativas das perguntas principais
│   ├── dados/perguntasQuizDerivadas.ts
│   │                                Perguntas adicionais do quiz
│   ├── dados/historicoQuiz.ts     Persistência local de acertos e erros
│   ├── contexto/                  Contexto e provedor do progresso de leitura
│   ├── hooks/                     Hooks da funcionalidade de dúvidas
│   ├── AcordeaoDuvidas.tsx        Exibição expansível das dúvidas
│   └── ChamadaQuiz.tsx            Card de acesso ao quiz
└── paginas/
    ├── Inicio.tsx                 Página inicial
    ├── PaginaCategoria.tsx        Página de uma categoria
    ├── ResultadoBusca.tsx         Página de resultados da busca
    ├── PaginaQuizMenu.tsx         Configuração do quiz
    ├── PaginaQuizJogo.tsx         Execução e resultado do quiz
    └── PaginaNaoEncontrada.tsx    Rota para endereços inválidos
```

## Dados e armazenamento

O conteúdo do site é mantido em arquivos TypeScript dentro de `src/funcionalidades/duvidas/dados`. O progresso de dúvidas abertas é armazenado em cookie e o histórico de respostas do quiz é armazenado em `localStorage`. Nenhum dado é enviado para servidor.

## Rotas

| Rota | Finalidade |
| --- | --- |
| `/` | Página inicial e categorias |
| `/categoria/:categoriaId` | Dúvidas de uma categoria |
| `/buscar?q=termo` | Resultado da busca |
| `/quiz` | Configuração do quiz |
| `/quiz/jogar` | Execução do quiz |
| Qualquer outra rota | Página 404 |
