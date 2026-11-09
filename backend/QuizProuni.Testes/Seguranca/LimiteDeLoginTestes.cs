using System.Net;
using System.Net.Http.Json;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Seguranca;

public class LimiteDeLoginTestes : TestesDeApi, IClassFixture<FabricaComLimitesBaixos>
{
    public LimiteDeLoginTestes(FabricaComLimitesBaixos fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Depois_do_limite_de_tentativas_o_login_devolve_429_e_o_bloqueio_fica_nos_logs()
    {
        var inicio = DateTimeOffset.UtcNow;
        var cliente = CriarVisitante();
        var tentativas = new List<HttpResponseMessage>();

        for (var tentativa = 0; tentativa <= FabricaComLimitesBaixos.Limite; tentativa++)
            tentativas.Add(await cliente.PostAsJsonAsync("/api/auth/login", new { email = "ninguem@teste.com", senha = "errada" }));
        var log = await AguardarLogAsync(x => x.DataHora >= inicio && x.Mensagem.Contains("Limite de uso excedido") && x.Caminho == "/api/auth/login");

        Assert.All(tentativas.Take(FabricaComLimitesBaixos.Limite), x => Assert.Equal(HttpStatusCode.Unauthorized, x.StatusCode));
        var bloqueada = tentativas.Last();
        var corpo = await LerJsonAsync(bloqueada);
        Assert.Equal(HttpStatusCode.TooManyRequests, bloqueada.StatusCode);
        Assert.Equal("LimiteExcedido", corpo.GetProperty("code").GetString());
        Assert.True(bloqueada.Headers.Contains("Retry-After"));
        Assert.NotNull(log);
        Assert.Equal("Warning", log.Nivel);
    }
}
