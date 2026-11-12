using System.Net;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Seguranca;

public class SaudeTestes : TestesDeApi
{
    public SaudeTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Health_responde_200_quando_o_banco_esta_acessivel_e_nao_exige_login()
    {
        var resposta = await CriarVisitante().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal("Healthy", await resposta.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Health_nao_cria_visitante_nem_deixa_cookie()
    {
        var resposta = await CriarVisitante().GetAsync("/health");

        Assert.False(resposta.Headers.Contains("Set-Cookie"));
    }
}
