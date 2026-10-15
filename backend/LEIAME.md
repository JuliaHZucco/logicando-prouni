# Logicando Prouni v2 — Backend

Backend com conteúdo, visitante anônimo, quiz individual, autenticação do moderador, salas ao vivo e eventos em tempo real. As telas do frontend ainda precisam ser integradas a estas APIs.

## O que esta etapa faz

| Arquivo | Função |
|---|---|
| `src/app.ts` | Configura e exporta a aplicação Express |
| `src/servidor.ts` | Cria o servidor HTTP, conecta o Socket.IO, inicia cronômetros e trata o encerramento |
| `src/config/ambiente.ts` | Valida e centraliza as variáveis de ambiente |
| `src/middlewares/erros.ts` | Trata rotas inexistentes e erros HTTP |
| `src/banco/pool.ts` | Conexão com o PostgreSQL |
| `src/middlewares/visitante.ts` | Identifica o visitante pelo cookie (sem cadastro, por causa da LGPD) e cria um novo quando precisa |
| `src/middlewares/moderador.ts` | Lê o cookie JWT e protege rotas do moderador |
| `src/modulos/conteudo/` | Rotas de categorias, dúvidas e progresso |
| `src/seed/` | Carga inicial das categorias, perguntas e alternativas (roda uma vez) |
| `src/modulos/quiz/` | Rotas e serviço do quiz individual |
| `src/modulos/auth/auth.rotas.ts` | Login, sessão atual e saída do moderador |
| `src/modulos/salas/` | Rotas e regras de salas, participantes, ranking, pódio e cronômetro |
| `src/tempoReal/` | Socket.IO, autenticação da conexão e eventos da sala |

Também existe `GET /api/saude`, que só responde `{ "ok": true }` para saber se o servidor está de pé.

## Como rodar

1. Instale o Node.js (versão LTS) e o PostgreSQL.
2. Crie o banco `feevale-prouni` e, a partir da pasta `backend`, execute `npm run migrate`.
3. Copie `.env.example` para `.env`, configure `DATABASE_URL` e troque o `JWT_SEGREDO`.
4. No terminal, dentro desta pasta:
   ```
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```
   Deve aparecer `Backend em http://localhost:3000`.
5. Abra `http://localhost:3000/api/categorias` no navegador: a lista vem do banco.

## Variáveis de ambiente

- `DATABASE_URL`: obrigatória.
- `JWT_SEGREDO`: obrigatória e deve ser longa e aleatória.
- `PORTA`: opcional, padrão `3000`.
- `NODE_ENV`: opcional, padrão `development`.
- `PASTA_FRONTEND`: opcional; quando definida, o backend também serve o build do frontend.

## Migrações

O comando `npm run migrate` lê os arquivos `.sql` de
`database/migrations` na ordem numérica e registra os arquivos aplicados na
tabela `schema_migrations`. Cada arquivo é executado dentro de uma transação.

Não edite uma migração depois que ela foi aplicada. Para uma alteração nova,
crie o próximo arquivo, por exemplo `002-autenticacao.sql`.

Para bancos novos, use `npm run migrate` como o único processo de criação.
Se o banco já tiver sido criado anteriormente, faça um baseline controlado
antes de executar a migração `001-criacao.sql`, pois ela cria o schema inicial.

## Organização dos módulos

O backend está organizado por módulos de negócio:

```text
src/
├── modulos/
│   ├── auth/
│   ├── conteudo/
│   ├── quiz/
│   └── salas/
├── tempoReal/
├── banco/
├── config/
├── compartilhado/
└── middlewares/
```

As camadas ainda não implementadas do quiz e as pastas compartilhadas permanecem
reservadas para refatorações futuras.

## APIs disponíveis

- `GET /api/saude`
- `GET /api/categorias`
- `GET` e `POST /api/progresso`
- `POST /api/quiz/partidas`
- `POST /api/quiz/partidas/:id/respostas`
- `POST /api/auth/login`
- `GET /api/auth/eu`
- `POST /api/auth/sair`
- `POST /api/salas`
- `GET /api/salas/minhas?busca=&de=&ate=`
- `POST /api/salas/:codigo/participantes`
- `GET /api/salas/:codigo/estado`
- `GET /api/salas/:codigo/ranking`

## Salas ao vivo

- O moderador cria a sala com as regras do quiz individual.
- Participantes entram por código e apelido, sem limite artificial de quantidade.
- O moderador avança, encerra perguntas, encerra a sala e pode iniciar nova rodada.
- O cronômetro é controlado pelo servidor e retomado após reinício.
- O ranking geral é restrito ao moderador dono da sala.
- O Socket.IO transmite pergunta, respostas, resultado, ranking e encerramento.

As telas do moderador e do participante ainda precisam ser criadas e conectadas
a essas APIs.

## Regras do quiz individual

- **Aleatório:** sem categorias.
- **Uma categoria:** exatamente uma.
- **Misto:** pelo menos uma categoria, e a quantidade mínima é o número de categorias escolhidas (o sorteio garante uma pergunta de cada).
- Quantidade de 1 a 10 perguntas.
- O navegador nunca recebe qual alternativa é a correta: a correção é feita no servidor, ao registrar a resposta.
