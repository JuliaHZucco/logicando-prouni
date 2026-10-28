using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Testes.Suporte;

public abstract class TestesDeApi : IClassFixture<FabricaDaApi>
{
    protected const string SenhaDoModerador = "senha-de-teste-123";

    protected readonly FabricaDaApi fabrica;

    protected TestesDeApi(FabricaDaApi fabrica)
    {
        this.fabrica = fabrica;
        fabrica.AplicarMigrations();
    }

    protected ClienteDeTeste CriarVisitante()
    {
        return new ClienteDeTeste(fabrica);
    }

    protected async Task<ClienteDeTeste> CriarModeradorLogadoAsync()
    {
        var email = $"moderador-{Guid.NewGuid():N}@teste.com";
        await UsarBancoAsync(async db =>
        {
            db.Moderadores.Add(new Moderador { Email = email, SenhaHash = BCrypt.Net.BCrypt.HashPassword(SenhaDoModerador) });
            await db.SaveChangesAsync();
            return 0;
        });

        var cliente = CriarVisitante();
        var resposta = await cliente.PostAsJsonAsync("/api/auth/login", new { email, senha = SenhaDoModerador });
        Assert.Equal(System.Net.HttpStatusCode.OK, resposta.StatusCode);
        return cliente;
    }

    protected async Task<T> UsarBancoAsync<T>(Func<QuizProuniContext, Task<T>> consulta)
    {
        using var escopo = fabrica.Services.CreateScope();
        return await consulta(escopo.ServiceProvider.GetRequiredService<QuizProuniContext>());
    }

    protected static async Task<JsonElement> LerJsonAsync(HttpResponseMessage resposta)
    {
        return await resposta.Content.ReadFromJsonAsync<JsonElement>();
    }

    protected static async Task<JsonElement> IniciarPartidaAsync(HttpClient cliente, string modo, int quantidade, string[]? categorias = null)
    {
        var resposta = await cliente.PostAsJsonAsync("/api/quiz/partidas", new { modo, categorias = categorias ?? Array.Empty<string>(), quantidade });
        Assert.Equal(System.Net.HttpStatusCode.Created, resposta.StatusCode);
        return await LerJsonAsync(resposta);
    }

    protected Task<int> ObterAlternativaCorretaIdAsync(string perguntaId)
    {
        return UsarBancoAsync(db => db.Alternativas
            .Where(x => x.PerguntaId == perguntaId && x.Correta)
            .Select(x => x.AlternativaId)
            .FirstAsync());
    }

    protected Task<int> ObterAlternativaErradaIdAsync(string perguntaId)
    {
        return UsarBancoAsync(db => db.Alternativas
            .Where(x => x.PerguntaId == perguntaId && !x.Correta)
            .Select(x => x.AlternativaId)
            .FirstAsync());
    }

    protected static Task<HttpResponseMessage> ResponderAsync(HttpClient cliente, int partidaId, string perguntaId, int alternativaId)
    {
        return cliente.PostAsJsonAsync($"/api/quiz/partidas/{partidaId}/respostas", new { perguntaId, alternativaId });
    }

    protected async Task<string> CriarSalaAsync(HttpClient moderador, int quantidade = 2, int? segundosPorPergunta = null, string nome = "Sala de teste")
    {
        var resposta = await moderador.PostAsJsonAsync("/api/salas", new
        {
            nome,
            modo = "aleatorio",
            categorias = Array.Empty<string>(),
            quantidade,
            segundosPorPergunta
        });
        Assert.Equal(System.Net.HttpStatusCode.Created, resposta.StatusCode);
        return (await LerJsonAsync(resposta)).GetProperty("codigo").GetString()!;
    }

    protected async Task EntrarNaSalaAsync(HttpClient participante, string codigo, string apelido)
    {
        var resposta = await participante.PostAsJsonAsync($"/api/salas/{codigo}/participantes", new { apelido });
        Assert.Equal(System.Net.HttpStatusCode.Created, resposta.StatusCode);
    }

    protected async Task<HubConnection> ConectarAsync(ClienteDeTeste cliente)
    {
        var conexao = new HubConnectionBuilder()
            .WithUrl("http://localhost/hubs/sala", opcoes =>
            {
                opcoes.Transports = HttpTransportType.LongPolling;
                opcoes.HttpMessageHandlerFactory = _ => fabrica.Server.CreateHandler();
                if (cliente.Jarra.CabecalhoCookie.Length > 0)
                    opcoes.Headers.Add("Cookie", cliente.Jarra.CabecalhoCookie);
            })
            .Build();

        await conexao.StartAsync();
        return conexao;
    }

    protected static Task<JsonElement> AguardarEventoAsync(HubConnection conexao, string nomeDoEvento, int segundosDeEspera = 10)
    {
        var espera = new TaskCompletionSource<JsonElement>();
        conexao.On<JsonElement>(nomeDoEvento, evento => espera.TrySetResult(evento));
        return espera.Task.WaitAsync(TimeSpan.FromSeconds(segundosDeEspera));
    }

    protected static async Task<bool> InvocarAsync(HubConnection conexao, string metodo, params object[] argumentos)
    {
        var resultado = await conexao.InvokeCoreAsync<JsonElement>(metodo, argumentos);
        return resultado.GetProperty("ok").GetBoolean();
    }

    protected Task<int> ObterAlternativaDaSalaAsync(string codigo, int ordem, bool correta)
    {
        return UsarBancoAsync(db => (
            from sala in db.Salas
            join salaPergunta in db.SalaPerguntas on sala.SalaId equals salaPergunta.SalaId
            join alternativa in db.Alternativas on salaPergunta.PerguntaId equals alternativa.PerguntaId
            where sala.Codigo == codigo && salaPergunta.Ordem == ordem && alternativa.Correta == correta
            select alternativa.AlternativaId
        ).FirstAsync());
    }
}
