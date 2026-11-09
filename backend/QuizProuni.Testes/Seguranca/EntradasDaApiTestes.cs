using System.Net;
using System.Net.Http.Json;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Seguranca;

public class EntradasDaApiTestes : TestesDeApi
{
    public EntradasDaApiTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Login_com_e_mail_ou_senha_gigantes_devolve_400_sem_tentar_autenticar()
    {
        var cliente = CriarVisitante();

        var resposta = await cliente.PostAsJsonAsync("/api/auth/login", new { email = new string('a', 300) + "@teste.com", senha = new string('b', 200) });
        var corpo = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        Assert.Equal("DadosInvalidos", corpo.GetProperty("code").GetString());
    }
}
