using System.Net;
using System.Net.Http.Json;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Logs;

public class LogsTestes : TestesDeApi
{
    public LogsTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Erro_de_negocio_e_gravado_na_tabela_de_logs()
    {
        var inicio = DateTimeOffset.UtcNow;
        var cliente = CriarVisitante();

        var resposta = await cliente.PostAsJsonAsync("/api/quiz/partidas", new { modo = "invalido", categorias = Array.Empty<string>(), quantidade = 3 });
        var log = await AguardarLogAsync(x => x.DataHora >= inicio && x.Caminho == "/api/quiz/partidas" && x.Mensagem.Contains("Modo inválido"));

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        Assert.NotNull(log);
        Assert.Equal("Warning", log.Nivel);
        Assert.Equal("POST", log.Metodo);
        Assert.False(string.IsNullOrEmpty(log.RequestId));
        Assert.Contains("ExceptionMiddleware", log.Categoria);
    }

    [Fact]
    public async Task Falha_de_login_e_gravada_com_o_ip_e_o_email_informado()
    {
        var inicio = DateTimeOffset.UtcNow;
        var email = $"tentativa-{Guid.NewGuid():N}@teste.com";

        var resposta = await CriarVisitante().PostAsJsonAsync("/api/auth/login", new { email, senha = "errada" });
        var log = await AguardarLogAsync(x => x.DataHora >= inicio && x.Mensagem.Contains("Falha de login") && x.Mensagem.Contains(email));

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
        Assert.NotNull(log);
        Assert.Equal("Warning", log.Nivel);
        Assert.Contains("ip=", log.Mensagem);
        Assert.Equal("POST", log.Metodo);
        Assert.Equal("/api/auth/login", log.Caminho);
        Assert.False(string.IsNullOrEmpty(log.RequestId));
    }
}
