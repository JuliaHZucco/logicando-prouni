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
- [Logs](#logs)
- [Cronômetro das perguntas](#cronômetro-das-perguntas)
- [Regras de negócio principais](#regras-de-negócio-principais)
- [API e tempo real](#api-e-tempo-real)

## Começando

No Windows, o projeto pode ser executado pelo VS Code. Basta abrir a pasta do projeto e usar o terminal integrado.

Na primeira vez é preciso preparar o banco e cadastrar um moderador. O passo a passo está em [Como rodar](#como-rodar).

## Como rodar

Passo a passo completo, do zero até o site no ar. Todos os comandos são executados **na pasta raiz do repositório** (onde estão `QuizProuni.sln`, `README.md` e `configurar-projeto.ps1`).

### 1. Pré-requisitos

- **.NET SDK 10** (confira com `dotnet --version`).
- **Node.js** (confira com `node --version`). A API usa o Node para compilar o front durante o build.
- **Visual Studio Code** com a extensão **C# Dev Kit**, da Microsoft.
- **PostgreSQL** instalado e **rodando**. No Windows ele roda como serviço (`postgresql-x64-18`, início automático). Para conferir: Win+R, `services.msc`, procure `postgresql` e veja se está "Em execução". Se estiver parado, clique com o botão direito e escolha "Iniciar".

### 2. Abrir o projeto no VS Code

1. Abra o **Visual Studio Code**.
2. Clique em **File > Open Folder...**.
3. Selecione a pasta do projeto, a que contém `README.md`, `QuizProuni.sln`, `backend` e `frontend`.
4. Abra **Terminal > New Terminal**. O terminal deve abrir na pasta raiz do projeto.
5. Se o caminho exibido no terminal não terminar em `logicando-prouni`, use o comando `cd` para entrar na pasta onde o projeto foi baixado.

### 3. Configuração automática (uma vez)

Não copie o conteúdo do script para o PowerShell. O arquivo [configurar-projeto.ps1](configurar-projeto.ps1) já está na pasta raiz. No terminal do VS Code, execute:

```powershell
.\configurar-projeto.ps1
```

Se o PowerShell bloquear a execução do script, permita somente para o terminal atual e execute-o novamente:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\configurar-projeto.ps1
```

O script fará algumas perguntas no terminal. Use estes valores, se forem os padrões da instalação:

1. Em **Host do PostgreSQL**, pressione `Enter` para usar `localhost`.
2. Em **Porta do PostgreSQL**, pressione `Enter` para usar `5432`.
3. Em **Usuário do PostgreSQL**, pressione `Enter` para usar `postgres`.
4. Em **Senha do PostgreSQL**, digite a senha definida na instalação do PostgreSQL. A senha não aparecerá enquanto for digitada; pressione `Enter` ao terminar.
5. Em **Chave JWT**, pressione `Enter` para o script gerar uma chave automaticamente. Se digitar uma, ela também não aparecerá na tela.

O script então:

- cria os bancos `quiz_prouni` e `quiz_prouni_teste`, caso ainda não existam;
- cria `backend/QuizProuni.Api/appsettings.Development.json` e `backend/QuizProuni.Testes/appsettings.Teste.json`;
- restaura a ferramenta `dotnet-ef` e baixa os pacotes NuGet do projeto;
- cria as tabelas e carrega as perguntas no banco de desenvolvimento.

Portanto, usando o script, **não é necessário criar os bancos nem executar as migrations separadamente**. O PostgreSQL precisa estar instalado e em execução. O script procura o `psql.exe` no `PATH` e também nas pastas padrão de instalação do PostgreSQL, então não é necessário configurar o `PATH` manualmente na instalação padrão.

#### Configuração manual

1. Copie `backend/QuizProuni.Api/appsettings.Development.example.json` para `backend/QuizProuni.Api/appsettings.Development.json`. Troque `SUA_SENHA` pela senha do PostgreSQL e `Jwt:Chave` por um texto de pelo menos 32 caracteres.
2. Copie `backend/QuizProuni.Testes/appsettings.Teste.example.json` para `backend/QuizProuni.Testes/appsettings.Teste.json` e faça o mesmo (banco `quiz_prouni_teste`).

Edite só os arquivos **sem** `.example` no nome. Eles estão no `.gitignore`, e os `.example.json` não podem receber senha real.

### 4. Configuração manual das tabelas (alternativa)

Se não usar `configurar-projeto.ps1`, crie primeiro os bancos vazios `quiz_prouni` e `quiz_prouni_teste` no pgAdmin. Depois execute na pasta raiz:

```powershell
dotnet tool restore
dotnet restore backend/QuizProuni.Api
dotnet ef database update --project backend/QuizProuni.Api
```

As migrations executam `backend/QuizProuni.Api/Dados/Migrations/001-criacao.sql` (schema) e `002-seed.sql` na mesma pasta (8 categorias e 87 perguntas).

### 5. Cadastrar um moderador (uma vez)

Nenhum moderador vem pronto: nem as migrations nem o seed criam um. Com a API **parada**, rode:

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

### 6. Rodar a aplicação

Depois da configuração e do cadastro do moderador, no terminal do VS Code inicie a API:

```powershell
dotnet run --project backend/QuizProuni.Api
```

Quando aparecer que a aplicação está ouvindo em `http://localhost:5098`, abra esse endereço no navegador. Não feche o terminal enquanto estiver usando o site.

Para desenvolver o front com atualização automática, deixe a API rodando e abra um segundo terminal pelo botão **+** no painel do terminal. Nesse segundo terminal, execute:

```
cd frontend
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`. O front de desenvolvimento encaminha as chamadas `/api` e `/hubs` para a API em `http://localhost:5098`. Para parar qualquer processo, clique no ícone de lixeira do terminal correspondente ou pressione `Ctrl+C`.

A API serve o site em **`http://localhost:5098`**. No primeiro build, ela instala as dependências do front e o compila para `backend/QuizProuni.Api/wwwroot` (essa pasta é gerada e não vai para o git). Nos builds seguintes o front só é recompilado se algum arquivo dele mudar. Para pular essa etapa, use `-p:PularFront=true`.

### 7. Testes

No terminal integrado do VS Code, execute na pasta raiz:

```powershell
dotnet test
```

Os testes usam o banco `quiz_prouni_teste`.

Para o front: `cd frontend`, depois `npm test` (testes automatizados, com Vitest), `npm run lint` e `npm run build`. Para deixar os testes rodando enquanto você edita o código, use `npm run test:watch`.

### 8. Alterar o banco: criar uma nova migration

Neste projeto o schema **não é gerado pelo EF Core**. Ele é escrito à mão em arquivos `.sql`, e cada migration só executa um desses arquivos com `migrationBuilder.Sql`. Por isso uma alteração no banco tem três partes que precisam ficar iguais: o **SQL**, a **classe da entidade** (e o `QuizProuniContext`, se houver algo especial) e a **migration**.

**Regra de ouro:** nunca edite uma migration (nem um `.sql`) que já foi aplicada em algum banco. Sempre crie uma nova.

O exemplo abaixo adiciona a coluna `descricao` na tabela `salas`. Todos os comandos rodam na pasta raiz, com o PostgreSQL ligado e a **API parada**.

**1. Escreva o SQL.** Crie `backend/QuizProuni.Api/Dados/Migrations/003-descricao-da-sala.sql`, seguindo a numeração dos arquivos existentes:

```sql
ALTER TABLE salas ADD COLUMN descricao varchar(200);
```

**2. Incorpore o arquivo ao projeto.** Em `backend/QuizProuni.Api/QuizProuni.Api.csproj`, junto das linhas `EmbeddedResource` já existentes, acrescente:

```xml
<EmbeddedResource Include="Dados\Migrations\003-descricao-da-sala.sql" LogicalName="003-descricao-da-sala.sql" />
```

Sem essa linha, a migration falha com `Script 003-descricao-da-sala.sql não encontrado`.

**3. Atualize a entidade.** Em `backend/QuizProuni.Api/Dados/Entidades/Sala.cs`, acrescente a propriedade:

```csharp
public string? Descricao { get; set; }
```

Só mexa em `Dados/QuizProuniContext.cs` se a mudança tiver algo além de uma coluna simples (índice, valor padrão, chave estrangeira, tabela nova). Para uma tabela nova, crie também a classe em `Entidades/` e o `DbSet` no contexto.

**4. Gere a migration.**

```powershell
dotnet tool restore
dotnet ef migrations add DescricaoDaSala --project backend/QuizProuni.Api
```

O comando cria `AAAAMMDDHHMMSS_DescricaoDaSala.cs` e o `.Designer.cs` em `Dados/Migrations/` e atualiza o `QuizProuniContextModelSnapshot.cs`. Não apague nem edite o snapshot e o Designer.

**5. Troque o conteúdo gerado pelo padrão do projeto.** O EF escreve sozinho um `AddColumn` (ou o código equivalente à mudança). Abra o arquivo novo e deixe os métodos assim, para a migration executar o seu SQL como as migrations `Inicial` e `Seed`:

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql(ScriptSql.Ler("003-descricao-da-sala.sql"));
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql("ALTER TABLE salas DROP COLUMN descricao;");
}
```

O `Down` desfaz a alteração. Escreva sempre, porque ele permite voltar atrás. Se você alterou só o SQL e não a entidade, o EF gera uma migration vazia, e basta preencher os dois métodos do mesmo jeito.

**6. Aplique no banco de desenvolvimento.**

```powershell
dotnet ef database update --project backend/QuizProuni.Api
```

O EF consulta a tabela `__EFMigrationsHistory`, descobre quais migrations ainda não rodaram e executa só essas.

**7. Rode os testes.**

```powershell
dotnet test
```

Os testes aplicam as migrations sozinhos no banco `quiz_prouni_teste`, então já validam o seu SQL. Se a alteração mexer nas perguntas do seed, atualize os números fixos de `backend/QuizProuni.Testes/Banco/SeedTestes.cs` (8 categorias, 87 perguntas).

**Outros comandos úteis**

| Comando | O que faz |
| --- | --- |
| `dotnet ef migrations list --project backend/QuizProuni.Api` | Lista as migrations e mostra quais já foram aplicadas |
| `dotnet ef database update <MigrationAnterior> --project backend/QuizProuni.Api` | Volta o banco até aquela migration (executa os `Down`) |
| `dotnet ef migrations remove --project backend/QuizProuni.Api` | Apaga a **última** migration. Só use se ela ainda **não** foi aplicada em nenhum banco |

**Cuidados**

- Se a migration já foi aplicada, não use `remove`. Volte o banco com `database update <MigrationAnterior>` ou crie uma nova migration que corrija.
- Antes de uma alteração destrutiva (apagar coluna, mudar tipo), faça backup do banco.
- Quem clonar o projeto depois recebe a migration junto: o `configurar-projeto.ps1` (ou o passo 4) aplica todas as pendentes.
- Os arquivos `appsettings.Development.json` e `appsettings.Teste.json` precisam existir, como no passo 3.

## Estrutura do projeto

Cada assunto tem **um lugar só**. Tudo sobre o Quiz, por exemplo, está em uma pasta do backend (`Funcionalidades/Quiz`) e em uma pasta do front (`funcionalidades/quiz`).

### Visão geral no VS Code

```text
logicando-prouni/
├── .config/                    ferramenta local dotnet-ef
├── backend/                    código C# e testes automatizados
│   ├── QuizProuni.Api/         API, SignalR e site compilado
│   ├── QuizProuni.Testes/      testes de integração
│   └── Repositorio/            projeto auxiliar para visualizar o repositório
├── frontend/                   site em React, TypeScript e Vite
├── configurar-projeto.ps1      configura PostgreSQL, arquivos appsettings e migrations
├── QuizProuni.sln              arquivo da solução .NET (não é necessário abrir no VS Code)
└── README.md                   documentação do projeto (este arquivo)
```

### Backend: `backend/QuizProuni.Api`

```text
QuizProuni.Api/
├── Program.cs                      configuração e inicialização
├── appsettings*.json               configuração (a de desenvolvimento não vai para o git)
├── Funcionalidades/                uma pasta por assunto do sistema
│   ├── Quiz/                           quiz individual (partidas, respostas, resultado)
│   ├── Salas/                          salas em grupo
│   │   └── TempoReal/                      SignalR: SalaHub, NotificadorDaSala e EncerradorDePerguntasVencidas
│   ├── Moderadores/                    login, sessão (JWT) e o comando criar-moderador
│   ├── Visitantes/                     identificação do visitante pelo cookie
│   ├── Conteudo/                       categorias e dúvidas do site
│   └── DuvidasVistas/                  dúvidas que o visitante já leu
├── Compartilhado/                  o que todas as funcionalidades usam
│   ├── RespostaBase.cs                 resposta com erro de negócio
│   ├── Excecoes/                       BLException (400), Conflito (409), 401, 403 e 404
│   ├── Middlewares/                    ExceptionMiddleware (exceção vira JSON)
│   ├── Logs/                           grava os logs na tabela logs (provider, fila e gravador)
│   └── Seguranca/                      limites de uso (rate limiting) e origem da requisição
├── Dados/                          banco de dados
│   ├── QuizProuniContext.cs            mapeamento do EF Core
│   ├── Entidades/                      uma classe por tabela
│   └── Migrations/                     migrations do EF e scripts SQL incorporados
│       ├── 001-criacao.sql                 schema
│       ├── 002-seed.sql                    perguntas
│       ├── 20261027010344_Inicial.cs       migration do schema
│       ├── 20261027010351_Seed.cs          migration das perguntas
│       └── ScriptSql.cs                     lê os scripts SQL incorporados
└── wwwroot/                        site compilado (gerado no build, não vai para o git)
```

**Dentro de cada pasta de `Funcionalidades`**, os arquivos seguem sempre o mesmo padrão:

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
├── Logs/               LogsTestes (confere que os erros são gravados na tabela logs)
├── Seguranca/          limites de uso e tamanho das entradas
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
├── testes/                  configuração e dados de apoio dos testes
└── utilitarios/api.ts       buscarJson, enviarJson, tratarErro e ErroApi
```

Os testes do front ficam **ao lado do código que testam**, em arquivos `*.test.ts` e `*.test.tsx`.

### Banco de dados: `backend/QuizProuni.Api/Dados/Migrations`

| Arquivo | Conteúdo |
| --- | --- |
| `001-criacao.sql` | Schema completo (17 tabelas, incluindo `logs`, onde a API grava os avisos e erros; veja [Logs](#logs)) |
| `002-seed.sql` | Carga inicial: 8 categorias e 87 perguntas, cada uma com 4 alternativas |

Quem executa os arquivos é a aplicação: as migrations do EF Core (`Inicial.cs` e `Seed.cs`, na mesma pasta) embutem estes `.sql` e os rodam com `migrationBuilder.Sql`. Alterações futuras do schema devem entrar como novos arquivos numerados (por exemplo `003-...sql`), com uma nova migration do EF que os execute, sem editar uma migração já aplicada em um banco. O passo a passo está em [8. Alterar o banco: criar uma nova migration](#8-alterar-o-banco-criar-uma-nova-migration).

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
| um teste da API | `backend/QuizProuni.Testes/<assunto>/` |
| um teste do front | ao lado do arquivo testado, em `frontend/src/**/*.test.ts(x)` |

## Páginas do site

| Rota | Finalidade |
| --- | --- |
| `/` | Início, categorias e contador de dúvidas vistas |
| `/categoria/:categoriaId` | Dúvidas da categoria (`?duvida=id` abre uma dúvida específica) |
| `/buscar?q=termo` | Resultados da busca, com "N dúvidas encontradas" |
| `/quiz` | Menu do quiz individual (aleatório, uma categoria ou misto) |
| `/quiz/jogar` | Partida individual, que mostra a alternativa correta a cada resposta, e resultado final |
| `/quiz/sala` | Entrar em uma sala com o código |
| `/sala/:codigo/apelido` | Escolher o apelido |
| `/sala/:codigo` | Partida do participante (celular) |
| `/moderador/login` | Entrada do moderador (quem já está logado vai direto para as salas) |
| `/moderador/salas` | Minhas salas, com filtros de nome, status e datas |
| `/moderador/salas/nova` | Criar sala |
| `/moderador/sala/:codigo` | Condução da sala ao vivo |
| `/moderador/sala/:codigo/ranking` | Ranking geral (só o moderador dono) |

## Logs

Os avisos e erros da API são gravados na tabela **`logs`** do banco (além de aparecerem no terminal). Assim, se algo der errado com quem está usando o site, dá para consultar depois o que aconteceu.

**O que é gravado:** por padrão, tudo de nível `Warning` para cima: erros de negócio (400), conflitos (409), acessos negados (403), erros inesperados (500, com o *stack trace* completo), **tentativas de login que falharam** e **bloqueios por excesso de requisições** (ambos com o IP de origem). Avisos meramente informativos, como "não encontrado" (404) e "não autorizado" (401), ficam só no terminal. O nível é configurado em `backend/QuizProuni.Api/appsettings.json`, em `Logging:Banco:LogLevel:Default` (por exemplo `Error` para gravar só os erros graves, ou `Information` para gravar mais).

| Coluna | Conteúdo |
| --- | --- |
| `data_hora` | Quando aconteceu (UTC) |
| `nivel` | `Warning`, `Error` ou `Critical` |
| `categoria` | De onde veio o log (por exemplo, `QuizProuni.Api.Compartilhado.Middlewares.ExceptionMiddleware`) |
| `mensagem` | Texto do log |
| `excecao` | Detalhes técnicos e *stack trace*, quando houve uma exceção |
| `request_id`, `metodo`, `caminho` | Identificam a requisição HTTP, quando o log veio dela (por exemplo `POST` em `/api/salas`) |

**Consultas úteis** (no pgAdmin ou com `psql -d quiz_prouni`):

```sql
-- os 50 logs mais recentes
SELECT log_id, data_hora, nivel, metodo, caminho, mensagem FROM logs ORDER BY log_id DESC LIMIT 50;

-- só os erros inesperados (500), com os detalhes
SELECT data_hora, caminho, mensagem, excecao FROM logs WHERE nivel = 'Error' ORDER BY log_id DESC;

-- tudo o que aconteceu em uma requisição (copie o request_id de um log)
SELECT * FROM logs WHERE request_id = '0HNPUFTMLE0BE:00000001' ORDER BY log_id;
```

**Como funciona:** o código está em `backend/QuizProuni.Api/Compartilhado/Logs/`. Cada log vai para uma fila na memória e um serviço em segundo plano (`GravadorDeLogs`) grava em lotes, para não atrasar a resposta ao usuário. Se o banco estiver fora do ar, a falha da gravação aparece apenas no terminal e a API continua funcionando. Os logs do próprio EF Core e do Npgsql não são gravados, para evitar um ciclo (gravar um log gera outro log).
## Cronômetro das perguntas

Quando a sala usa cronômetro, o **banco é quem sabe se o prazo acabou**: cada pergunta aberta guarda a hora de abertura (`exibicoes.data_abertura`) e a sala guarda os segundos por pergunta. Não existe temporizador em memória.

O serviço `EncerradorDePerguntasVencidas` (em `Funcionalidades/Salas/TempoReal`) roda em segundo plano e, a cada 0,25 segundo, procura as salas com pergunta aberta e prazo vencido. Para cada uma, pede ao `SalaAoVivoService` que encerre a pergunta, o que grava o resultado e avisa a sala por SignalR, igual ao encerramento feito pelo moderador.

Por isso o cronômetro **sobrevive a reinícios da API**: ao subir, a primeira varredura encerra na hora as perguntas cujo prazo passou durante a parada. Também é seguro se o moderador encerrar a pergunta no mesmo instante: o encerramento trava a sala no banco e confere de novo o estado e o prazo, então só um deles vale. A resposta do participante continua recusada depois do prazo (com 1 segundo de folga para a rede), com ou sem a varredura.

## Regras de negócio principais

- O servidor guarda e valida a resposta correta. O front só recebe a alternativa correta depois de responder (no quiz individual) ou quando a pergunta fecha (na sala, inclusive para o moderador).
- O resultado só é positivo quando o aproveitamento é **maior que 50%**. Exatamente 50% não conta.
- A quantidade de perguntas vai de 1 a 10. No modo misto, o mínimo é uma pergunta por categoria escolhida.
- Cada participante responde uma vez por pergunta em cada rodada. A violação devolve 409.
- O apelido tem até 20 caracteres e é único na sala, sem diferenciar maiúsculas e minúsculas.
- O moderador só inicia a partida com pelo menos um participante na sala. O servidor recusa a ação sem ninguém, e o botão "Iniciar partida" fica desabilitado até a primeira pessoa entrar.
- O participante pode sair da sala pelo botão "Voltar e sair da sala" na tela de espera, tanto antes da primeira partida quanto quando o moderador abre uma nova rodada. Com a partida em andamento, não pode sair. Quem sai numa nova rodada deixa de aparecer no ranking dela e tem as respostas das rodadas anteriores apagadas do banco junto com o participante. Se todos saírem, o moderador volta a não poder iniciar.
- A sessão do moderador dura 12 horas. Ele pode navegar pelo site, pelas dúvidas e pela busca sem perder o login (o logo do painel leva à página inicial); só sai pelo botão "Sair" ou quando a sessão expira, e nesse caso é levado à tela de login.
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
| `DELETE /api/salas/{codigo}/participantes/eu` | O participante sai da sala. Só vale antes da partida começar; depois devolve 409 |
| `GET /api/salas/{codigo}/estado` | Estado atual da sala, para quem entra ou recarrega a página |

### Tempo real (SignalR)

O hub fica em `/hubs/sala`, com um grupo por sala e um grupo à parte para o moderador. O cliente só envia intenções, e o servidor valida o estado e o dono da sala antes de aceitar.

Métodos que o cliente chama (todos devolvem `{ ok, erro }`): `EntrarSala`, `Responder`, `Avancar`, `EncerrarPergunta`, `JogarNovamente` e `EncerrarSala`.

| Evento | Quando é enviado |
| --- | --- |
| `participante-entrou` | Alguém entrou na sala. Traz a lista de participantes e o total |
| `participante-saiu` | Alguém saiu da sala antes da partida. Traz a lista de participantes e o total |
| `pergunta-iniciada` | O moderador abriu uma pergunta. Traz o enunciado e as alternativas, sem a correta |
| `resposta-registrada` | Um participante respondeu (só para o moderador). Traz quantas respostas já chegaram |
| `pergunta-encerrada` | A pergunta fechou, pelo moderador ou porque o prazo acabou (veja "Cronômetro das perguntas") |
| `resultado-disponivel` | Logo depois de `pergunta-encerrada`: resultado da pergunta com a alternativa correta, o gráfico e a explicação |
| `quiz-finalizado` | Fim do quiz: ranking com o pódio (`encerrada: false`) ou sala encerrada pelo moderador (`encerrada: true`) |
| `nova-rodada` | O moderador abriu uma nova rodada ("Jogar novamente") |
