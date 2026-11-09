using System.Net;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Seguranca;

public class LimiteDeAcessoASalaTestes : TestesDeApi, IClassFixture<FabricaComLimitesBaixos>
{
    public LimiteDeAcessoASalaTestes(FabricaComLimitesBaixos fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Depois_do_limite_de_consultas_a_codigos_de_sala_a_api_devolve_429()
    {
        var cliente = CriarVisitante();
        var respostas = new List<HttpResponseMessage>();

        for (var tentativa = 0; tentativa <= FabricaComLimitesBaixos.Limite; tentativa++)
            respostas.Add(await cliente.GetAsync("/api/salas/ZZZZZZ/estado"));

        Assert.All(respostas.Take(FabricaComLimitesBaixos.Limite), x => Assert.Equal(HttpStatusCode.NotFound, x.StatusCode));
        Assert.Equal(HttpStatusCode.TooManyRequests, respostas.Last().StatusCode);
    }
}
