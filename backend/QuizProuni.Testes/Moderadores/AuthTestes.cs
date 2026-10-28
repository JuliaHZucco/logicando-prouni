using System.Net;
using System.Net.Http.Json;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Moderadores;

public class AuthTestes : TestesDeApi
{
    public AuthTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Login_correto_grava_cookie_e_eu_devolve_o_email()
    {
        var cliente = await CriarModeradorLogadoAsync();

        var resposta = await cliente.GetAsync("/api/auth/eu");
        var corpo = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.EndsWith("@teste.com", corpo.GetProperty("email").GetString());
        Assert.Contains("moderador=", cliente.Jarra.CabecalhoCookie);
    }

    [Fact]
    public async Task Login_com_senha_errada_devolve_401()
    {
        var cliente = await CriarModeradorLogadoAsync();
        var email = (await LerJsonAsync(await cliente.GetAsync("/api/auth/eu"))).GetProperty("email").GetString();
        var outro = CriarVisitante();

        var resposta = await outro.PostAsJsonAsync("/api/auth/login", new { email, senha = "errada" });
        var corpo = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
        Assert.Equal("E-mail ou senha incorretos.", corpo.GetProperty("message").GetString());
    }

    [Fact]
    public async Task Login_de_email_inexistente_devolve_401()
    {
        var cliente = CriarVisitante();

        var resposta = await cliente.PostAsJsonAsync("/api/auth/login", new { email = "ninguem@teste.com", senha = "qualquer" });

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Eu_sem_login_devolve_401()
    {
        var cliente = CriarVisitante();

        var resposta = await cliente.GetAsync("/api/auth/eu");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Sair_remove_a_sessao()
    {
        var cliente = await CriarModeradorLogadoAsync();

        var saida = await cliente.PostAsync("/api/auth/sair", null);
        var depois = await cliente.GetAsync("/api/auth/eu");

        Assert.Equal(HttpStatusCode.NoContent, saida.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, depois.StatusCode);
    }
}
