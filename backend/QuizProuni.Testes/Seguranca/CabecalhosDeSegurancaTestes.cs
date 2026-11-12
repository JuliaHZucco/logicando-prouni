using System.Net;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Seguranca;

public class CabecalhosDeSegurancaTestes : TestesDeApi
{
    public CabecalhosDeSegurancaTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Toda_resposta_leva_os_cabecalhos_de_seguranca()
    {
        var resposta = await CriarVisitante().GetAsync("/api/conteudo");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal("nosniff", resposta.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", resposta.Headers.GetValues("X-Frame-Options").Single());
        Assert.Equal("strict-origin-when-cross-origin", resposta.Headers.GetValues("Referrer-Policy").Single());
        Assert.Contains("camera=()", resposta.Headers.GetValues("Permissions-Policy").Single());
    }

    [Fact]
    public async Task A_politica_de_conteudo_so_aceita_o_proprio_site_e_libera_o_websocket_do_mesmo_endereco()
    {
        var resposta = await CriarVisitante().GetAsync("/api/conteudo");

        var politica = resposta.Headers.GetValues("Content-Security-Policy").Single();
        Assert.Contains("default-src 'self'", politica);
        Assert.Contains("script-src 'self'", politica);
        Assert.Contains("frame-ancestors 'none'", politica);
        Assert.Contains("object-src 'none'", politica);
        Assert.Contains("connect-src 'self' ws://localhost wss://localhost", politica);
        Assert.DoesNotContain("unsafe-inline", politica);
        Assert.DoesNotContain("unsafe-eval", politica);
    }

    [Fact]
    public async Task Respostas_de_erro_tambem_levam_os_cabecalhos()
    {
        var resposta = await CriarVisitante().GetAsync("/api/rota-que-nao-existe");

        Assert.True(resposta.Headers.Contains("X-Content-Type-Options"));
        Assert.True(resposta.Headers.Contains("Content-Security-Policy"));
    }
}
