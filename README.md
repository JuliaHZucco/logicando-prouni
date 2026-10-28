# Feevale Prouni

Projeto acadêmico da Universidade Feevale (disciplina de banco de dados), ligado ao projeto de extensão Logicando. O site tira dúvidas sobre o PROUNI e tem um quiz com dois usos:

1. **Quiz individual:** o visitante escolhe o modo, joga sozinho e vê o resultado.
2. **Quiz em sala (estilo Kahoot):** um moderador cria uma sala, os participantes entram pelo celular com um código, respondem em sincronia e o resultado aparece em tempo real.

O front é em React, TypeScript, Vite e Bootstrap. O backend é em C# (.NET 10, ASP.NET Core MVC, EF Core e SignalR) com PostgreSQL.

## Índice

- [Começando](#começando)
- [Como rodar](#como-rodar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Páginas do site](#páginas-do-site)
- [Regras de negócio principais](#regras-de-negócio-principais)
- [API e tempo real](#api-e-tempo-real)
- [Decisões tomadas](#decisões-tomadas)
- [Limitações conhecidas](#limitações-conhecidas)
- [Trabalhos futuros](#trabalhos-futuros)

## Começando

Abra **`QuizProuni.sln`** no Visual Studio, deixe `QuizProuni.Api` como projeto de inicialização e clique em play (F5). A API serve o site em `http://localhost:5098`.

Na primeira vez é preciso preparar o banco e cadastrar um moderador. O passo a passo está em [Como rodar](#como-rodar).

## Como rodar

Passo a passo completo, do zero até o site no ar. Todos os comandos são executados **na pasta raiz do repositório** (onde está o `QuizProuni.sln`). No Visual Studio, o terminal (**Exibir > Terminal**) já abre nessa pasta.

### 1. Pré-requisitos

- **.NET SDK 10** (confira com `dotnet --version`).
- **Node.js** (confira com `node --version`). A API usa o Node para compilar o front durante o build.
- **PostgreSQL** instalado e **rodando**. No Windows ele roda como serviço (`postgresql-x64-18`, início automático). Para conferir: Win+R, `services.msc`, procure `postgresql` e veja se está "Em execução". Se estiver parado, clique com o botão direito e escolha "Iniciar".

### 2. Criar os bancos (uma vez)

Crie dois bancos vazios, `quiz_prouni` (desenvolvimento) e `quiz_prouni_teste` (testes), no pgAdmin ou com o comando `CREATE DATABASE quiz_prouni;`.

### 3. Configuração (uma vez)

1. Copie `backend/QuizProuni.Api/appsettings.Development.example.json` para `backend/QuizProuni.Api/appsettings.Development.json`. Troque `SUA_SENHA` pela senha do PostgreSQL e `Jwt:Chave` por um texto de pelo menos 32 caracteres.
2. Copie `backend/QuizProuni.Testes/appsettings.Teste.example.json` para `backend/QuizProuni.Testes/appsettings.Teste.json` e faça o mesmo (banco `quiz_prouni_teste`).

Edite só os arquivos **sem** `.example` no nome. Eles estão no `.gitignore`, e os `.example.json` não podem receber senha real.

### 4. Criar as tabelas e carregar as perguntas (uma vez)

```
dotnet tool restore
dotnet ef database update --project backend/QuizProuni.Api
```

As migrations executam `backend/QuizProuni.Api/Dados/Migrations/001-criacao.sql` (schema) e `002-seed.sql` na mesma pasta (8 categorias e 87 perguntas).

### 5. Cadastrar um moderador (uma vez)

Nenhum moderador vem pronto: nem as migrations nem o seed criam um. Com a API **parada** (o comando recompila, e o Visual Studio trava o executável enquanto depura), rode:

```
dotnet run --project backend/QuizProuni.Api -- criar-moderador <email> <senha>
```

Exemplo: `dotnet run --project backend/QuizProuni.Api -- criar-moderador professor@feevale.br Senha1234`. Se a senha tiver caracteres especiais (como cifrão, e comercial ou espaço), coloque-a entre aspas simples no PowerShell. A mensagem `Moderador cadastrado: ...` confirma.

- O e-mail é gravado em minúsculas e a senha é gravada com BCrypt (a senha em texto nunca é salva nem exibida).
- O e-mail precisa ser válido e a senha precisa ter pelo menos 8 caracteres.
- Se o e-mail já existir (sem diferenciar maiúsculas), o comando recusa e não altera nada.
- Código de saída: `0` quando cadastrou e `1` quando recusou.
- O comando usa o banco de `ConnectionStrings:QuizProuni`. Para cadastrar no banco de testes, defina a variável de ambiente `ConnectionStrings__QuizProuni` apontando para ele.
- A senha digitada na linha de comando fica no histórico do terminal. Use uma senha que você troque depois, se isso for um problema.

### 6. Rodar

- **Visual Studio:** abra `QuizProuni.sln`, deixe `QuizProuni.Api` como projeto de inicialização e clique em play (F5). O Solution Explorer mostra também o front, o banco e a documentação (projeto `Repositorio`), então uma janela só serve para ver o código e rodar.
- **Terminal:** `dotnet run --project backend/QuizProuni.Api`.

A API serve o site em **`http://localhost:5098`**. No primeiro build, ela instala as dependências do front e o compila para `backend/QuizProuni.Api/wwwroot` (essa pasta é gerada e não vai para o git). Nos builds seguintes o front só é recompilado se algum arquivo dele mudar. Para pular essa etapa, use `-p:PularFront=true`.

**Desenvolvimento do front (opcional):** com a API rodando, abra outro terminal e rode `cd frontend`, `npm install` e `npm run dev`. O site de desenvolvimento fica em `http://localhost:5173` (recarrega ao salvar), e o Vite repassa `/api` e `/hubs` para a API.

### 7. Testes

`dotnet test` na pasta raiz, ou no Visual Studio: **Testes > Executar Todos os Testes**. Eles usam o banco `quiz_prouni_teste`.

Para o front: `cd frontend`, depois `npm run lint` e `npm run build`.

## Estrutura do projeto

Cada assunto tem **um lugar só**. Tudo sobre o Quiz, por exemplo, está em uma pasta do backend (`Funcionalidades/Quiz`) e em uma pasta do front (`funcionalidades/quiz`).

### Visão geral

```text
logicando-prouni/
├── QuizProuni.sln         solution: abra este arquivo no Visual Studio
├── README.md              a documentação do projeto (este arquivo)
├── .config/               ferramentas do .NET (dotnet-ef)
├── backend/               tudo em C# (.NET)
│   ├── QuizProuni.Api/        a aplicação: API, tempo real e o site compilado
│   ├── QuizProuni.Testes/     testes de integração
│   └── Repositorio/           projeto sem código, só mostra o repositório inteiro no Visual Studio
├── frontend/              o site em React + TypeScript
```

### Backend: `backend/QuizProuni.Api`

```text
QuizProuni.Api/
├── Program.cs                      configuração e inicialização
├── appsettings*.json               configuração (a de desenvolvimento não vai para o git)
├── Funcionalidades/                uma pasta por assunto do sistema
│   ├── Quiz/                           quiz individual (partidas, respostas, resultado)
│   ├── Salas/                          salas em grupo
│   │   └── TempoReal/                      SignalR: SalaHub, NotificadorDaSala, CronometroDasSalas
│   ├── Moderadores/                    login, sessão (JWT) e o comando criar-moderador
│   ├── Visitantes/                     identificação do visitante pelo cookie
│   ├── Conteudo/                       categorias e dúvidas do site
│   └── DuvidasVistas/                  dúvidas que o visitante já leu
├── Compartilhado/                  o que todas as funcionalidades usam
│   ├── RespostaBase.cs                 resposta com erro de negócio
│   ├── Excecoes/                       BLException (400), Conflito (409), 401, 403 e 404
│   └── Middlewares/                    ExceptionMiddleware (exceção vira JSON)
├── Dados/                          banco de dados
│   ├── QuizProuniContext.cs            mapeamento do EF Core
│   ├── Entidades/                      uma classe por tabela
│   └── Migrations/                     migrations do EF e os .sql que elas executam
│       ├── 001-criacao.sql                 schema
│       └── 002-seed.sql                    perguntas
└── wwwroot/                        site compilado (gerado no build, não vai para o git)
```

**Dentro de cada pasta de `Funcionalidades`**, os arquivos seguem sempre o mesmo padrão (o mesmo do CaixaDigital):

| Arquivo | Papel |
| --- | --- |
| `XxxController.cs` | Recebe a requisição HTTP. Fino, sem regra de negócio |
| `XxxService.cs` | Só repassa para as regras (injeção de dependência e log) |
| `XxxRegras.cs` | Regras de negócio (`try/catch`, log e devolve `Erro` em vez de lançar exceção) |
| `XxxBags.cs` | Classes de entrada (`Request`) e saída (`Response`) da funcionalidade |

### Testes: `backend/QuizProuni.Testes`

```text
QuizProuni.Testes/
├── Quiz/               QuizTestes
├── Salas/              SalasTestes (HTTP) e SalaAoVivoTestes (SignalR)
├── Moderadores/        AuthTestes e CriarModeradorComandoTestes
├── Conteudo/           ConteudoTestes (conteúdo e dúvidas vistas)
├── Banco/              SeedTestes (confere as 87 perguntas carregadas)
└── Suporte/            FabricaDaApi, TestesDeApi e ClienteDeTeste (base dos testes)
```

### Front: `frontend/src`

```text
src/
├── main.tsx, App.tsx        entrada e tabela de rotas
├── index.css                estilos globais
├── paginas/                 uma pasta por área do site; cada arquivo é uma tela (rota)
│   ├── site/                    início, categoria, busca e página 404
│   ├── quiz/                    menu, partida individual e entrar em uma sala
│   ├── participante/            apelido e partida na sala (celular)
│   └── moderador/               login, minhas salas, criar sala, sala ao vivo e ranking geral
├── funcionalidades/         a lógica de cada assunto
│   ├── duvidas/                 conteúdo, dúvidas vistas e acordeão
│   ├── quiz/                    API e tipos do quiz individual
│   ├── salas/                   conexão SignalR e telas do participante
│   └── moderador/               API do moderador e telas da sala ao vivo
│       (cada uma com as subpastas componentes/, hooks/, servicos/, contexto/, telas/ e utilitarios/ que precisar)
├── layout/                  estrutura de página do site e do moderador
├── componentes/             componentes usados em várias áreas (alerta, carregando, pódio, gráfico)
└── utilitarios/api.ts       buscarJson, enviarJson, tratarErro e ErroApi
```

### Banco de dados: `backend/QuizProuni.Api/Dados/Migrations`

| Arquivo | Conteúdo |
| --- | --- |
| `001-criacao.sql` | Schema completo (16 tabelas). É a única fonte oficial do schema |
| `002-seed.sql` | Carga inicial: 8 categorias e 87 perguntas, cada uma com 4 alternativas |

Quem executa os arquivos é a aplicação: as migrations do EF Core (`Inicial.cs` e `Seed.cs`, na mesma pasta) embutem estes `.sql` e os rodam com `migrationBuilder.Sql`. Alterações futuras do schema devem entrar como novos arquivos numerados (por exemplo `003-...sql`), com uma nova migration do EF que os execute, sem editar uma migração já aplicada em um banco.

### Onde mexer quando eu quero...

| Quero mexer em... | Está em... |
| --- | --- |
| uma regra do quiz ou da sala | `backend/QuizProuni.Api/Funcionalidades/<assunto>/…Regras.cs` |
| uma rota da API | `backend/QuizProuni.Api/Funcionalidades/<assunto>/…Controller.cs` |
| um evento em tempo real | `backend/QuizProuni.Api/Funcionalidades/Salas/TempoReal/` |
| uma tabela | `backend/QuizProuni.Api/Dados/Entidades/` e `backend/QuizProuni.Api/Dados/Migrations/` |
| uma tela do site | `frontend/src/paginas/<área>/` |
| a chamada de uma tela à API | `frontend/src/funcionalidades/<assunto>/servicos/` |
| o texto ou conteúdo das dúvidas | `backend/QuizProuni.Api/Dados/Migrations/002-seed.sql` |
| as cores e o visual | `frontend/src/index.css` |
| um teste | `backend/QuizProuni.Testes/<assunto>/` |

## Páginas do site

| Rota | Finalidade |
| --- | --- |
| `/` | Início, categorias e contador de dúvidas vistas |
| `/categoria/:categoriaId` | Dúvidas da categoria (`?duvida=id` abre uma dúvida específica) |
| `/buscar?q=termo` | Resultados da busca, com "N dúvidas encontradas" |
| `/quiz` | Menu do quiz individual (aleatório, uma categoria ou misto) |
| `/quiz/jogar` | Partida individual, com explicação a cada resposta e resultado final |
| `/quiz/sala` | Entrar em uma sala com o código |
| `/sala/:codigo/apelido` | Escolher o apelido |
| `/sala/:codigo` | Partida do participante (celular) |
| `/moderador/login` | Entrada do moderador |
| `/moderador/salas` | Minhas salas, com filtros de nome, status e datas |
| `/moderador/salas/nova` | Criar sala |
| `/moderador/sala/:codigo` | Condução da sala ao vivo |
| `/moderador/sala/:codigo/ranking` | Ranking geral (só o moderador dono) |

## Regras de negócio principais

- O servidor guarda e valida a resposta correta. O front só recebe a alternativa correta depois de responder (no quiz individual) ou quando a pergunta fecha (na sala, inclusive para o moderador).
- O resultado só é positivo quando o aproveitamento é **maior que 50%**. Exatamente 50% não conta.
- A quantidade de perguntas vai de 1 a 10. No modo misto, o mínimo é uma pergunta por categoria escolhida.
- Cada participante responde uma vez por pergunta em cada rodada. A violação devolve 409.
- O apelido tem até 20 caracteres e é único na sala, sem diferenciar maiúsculas e minúsculas.
- "Jogar novamente" na sala abre uma nova rodada, com os mesmos participantes, placar zerado e respostas anteriores preservadas.
- Os participantes veem só o pódio com os três primeiros e a própria posição. O ranking geral é exclusivo do moderador.

## API e tempo real

### Rotas da API

| Rota | O que faz |
| --- | --- |
| `GET /api/conteudo` | Categorias e dúvidas do site |
| `GET /api/duvidas-vistas` e `POST /api/duvidas-vistas` | Lista e registra as dúvidas vistas do visitante |
| `POST /api/quiz/partidas` | Cria uma partida (ou repete uma, com `repetirPartidaId`) |
| `POST /api/quiz/partidas/{id}/respostas` | Registra uma resposta e devolve a correção |
| `GET /api/quiz/partidas/{id}/resultado` | Resultado da partida: acertos, percentual, se o aproveitamento é positivo e cada pergunta com acertou ou errou (`null` se ainda não respondeu) |
| `POST /api/auth/login`, `GET /api/auth/eu`, `POST /api/auth/sair` | Sessão do moderador |
| `POST /api/salas` | Cria uma sala (moderador) |
| `GET /api/salas/minhas?busca=&estado=&de=&ate=` | Salas do moderador. `estado` aceita `aguardando`, `em_andamento` (pergunta aberta, resultado ou ranking) e `encerrada` |
| `GET /api/salas/{codigo}/ranking` | Ranking geral (só o moderador dono) |
| `POST /api/salas/{codigo}/participantes` | Entra na sala (ou reconecta) |
| `GET /api/salas/{codigo}/estado` | Estado atual da sala, para quem entra ou recarrega a página |

### Tempo real (SignalR)

O hub fica em `/hubs/sala`, com um grupo por sala e um grupo à parte para o moderador. O cliente só envia intenções, e o servidor valida o estado e o dono da sala antes de aceitar.

Métodos que o cliente chama (todos devolvem `{ ok, erro }`): `EntrarSala`, `Responder`, `Avancar`, `EncerrarPergunta`, `JogarNovamente` e `EncerrarSala`.

| Evento | Quando é enviado |
| --- | --- |
| `participante-entrou` | Alguém entrou na sala. Traz a lista de participantes e o total |
| `pergunta-iniciada` | O moderador abriu uma pergunta. Traz o enunciado e as alternativas, sem a correta |
| `resposta-registrada` | Um participante respondeu (só para o moderador). Traz quantas respostas já chegaram |
| `pergunta-encerrada` | A pergunta fechou, pelo moderador ou pelo cronômetro do servidor |
| `resultado-disponivel` | Logo depois de `pergunta-encerrada`: resultado da pergunta com a alternativa correta, o gráfico e a explicação |
| `quiz-finalizado` | Fim do quiz: ranking com o pódio (`encerrada: false`) ou sala encerrada pelo moderador (`encerrada: true`) |
| `nova-rodada` | O moderador abriu uma nova rodada. Não faz parte da lista original de eventos, mas "Jogar novamente" precisa dele |

O evento `sala-criada` da lista original não existe, porque a sala é criada por uma chamada comum da API e não precisa avisar ninguém.

## Decisões tomadas

- **Percentual de acerto da pergunta:** é calculado sobre quem respondeu. Quem não respondeu aparece à parte, em `naoResponderam`.
- **Apelido:** no máximo 20 caracteres (limite do protótipo), único na sala sem diferenciar maiúsculas e minúsculas. O schema aceita 30.
- **Apelido obrigatório:** a API responde 400 com `code: "PrecisaApelido"`. A tela de entrada usa esse `code` para pedir o apelido.
- **"Jogar de novo" no quiz individual:** as perguntas repetem na mesma ordem e as alternativas são embaralhadas de novo, porque o schema não guarda a ordem das alternativas.
- **Resposta do quiz individual:** devolve `correta`, `alternativaCorretaId`, `explicacao` e `baseDuvidaId`.
- **Resultado do quiz individual:** vem do servidor (`GET /api/quiz/partidas/{id}/resultado`), inclusive a regra de que só mais de 50% é positivo.

## Limitações conhecidas

- O cronômetro das perguntas não é retomado se o servidor reiniciar com uma pergunta aberta. O moderador encerra a pergunta manualmente.
- O projeto roda em ambiente local, em um único processo (a API serve o site). Não há configuração de HTTPS, CORS nem publicação.

## Trabalhos futuros

Estes pontos foram discutidos e **não foram implementados**:

- Exportação de resultados (CSV, Excel ou PDF).
- Tempo de retenção das salas.
- Funcionamento sem internet.
