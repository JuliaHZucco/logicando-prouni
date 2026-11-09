using System.Net;
using System.Net.Http.Json;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Seguranca;

public class LimiteDeNovosVisitantesTestes : TestesDeApi, IClassFixture<FabricaComLimitesBaixos>
{
    public LimiteDeNovosVisitantesTestes(FabricaComLimitesBaixos fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Origem_que_cria_visitantes_demais_e_bloqueada_mas_quem_ja_tem_cookie_continua_usando_o_site()
    {
        var primeiro = CriarVisitante();
        var respostasDoPrimeiro = new List<HttpStatusCode>();
        for (var uso = 0; uso < FabricaComLimitesBaixos.Limite + 2; uso++)
            respostasDoPrimeiro.Add((await primeiro.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" })).StatusCode);

        var novos = new List<HttpResponseMessage>();
        for (var criacao = 1; criacao < FabricaComLimitesBaixos.Limite + 1; criacao++)
            novos.Add(await CriarVisitante().PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" }));

        Assert.All(respostasDoPrimeiro, x => Assert.Equal(HttpStatusCode.OK, x));
        Assert.All(novos.Take(FabricaComLimitesBaixos.Limite - 1), x => Assert.Equal(HttpStatusCode.OK, x.StatusCode));
        var bloqueado = novos.Last();
        var corpo = await LerJsonAsync(bloqueado);
        Assert.Equal(HttpStatusCode.TooManyRequests, bloqueado.StatusCode);
        Assert.Equal("LimiteExcedido", corpo.GetProperty("code").GetString());
        Assert.False(bloqueado.Headers.Contains("Set-Cookie"));
    }
}
