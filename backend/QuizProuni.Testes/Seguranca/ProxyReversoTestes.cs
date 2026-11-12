using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using QuizProuni.Api.Compartilhado.Seguranca;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Seguranca;

public class ProxyReversoTestes : TestesDeApi, IClassFixture<FabricaComProxyReverso>
{
    public ProxyReversoTestes(FabricaComProxyReverso fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Com_o_proxy_ligado_o_cookie_do_visitante_sai_com_Secure_quando_o_proxy_avisa_que_era_https()
    {
        var visitante = CriarVisitante();
        visitante.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.50");
        visitante.DefaultRequestHeaders.Add("X-Forwarded-Proto", "https");

        var resposta = await visitante.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" });

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        var cookie = Assert.Single(resposta.Headers.GetValues("Set-Cookie"), x => x.StartsWith("visitante="));
        Assert.Contains("secure", cookie, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Com_o_proxy_ligado_cada_IP_de_origem_tem_o_seu_proprio_limite_de_novos_visitantes()
    {
        var respostasDoPrimeiroIp = new List<HttpStatusCode>();
        for (var criacao = 0; criacao < FabricaComProxyReverso.Limite + 1; criacao++)
        {
            var visitante = CriarVisitante();
            visitante.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.60");
            respostasDoPrimeiroIp.Add((await visitante.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" })).StatusCode);
        }

        var outroIp = CriarVisitante();
        outroIp.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.61");
        var respostaDoOutroIp = await outroIp.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" });

        Assert.Equal(HttpStatusCode.TooManyRequests, respostasDoPrimeiroIp.Last());
        Assert.All(respostasDoPrimeiroIp.Take(FabricaComProxyReverso.Limite), x => Assert.Equal(HttpStatusCode.OK, x));
        Assert.Equal(HttpStatusCode.OK, respostaDoOutroIp.StatusCode);
    }
}

public class ProxyReversoDesligadoTestes : TestesDeApi, IClassFixture<FabricaComLimitesBaixos>
{
    public ProxyReversoDesligadoTestes(FabricaComLimitesBaixos fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Sem_a_configuracao_o_site_ignora_os_cabecalhos_de_proxy_e_nao_deixa_ninguem_forjar_o_IP()
    {
        var respostas = new List<HttpStatusCode>();
        for (var criacao = 0; criacao < FabricaComLimitesBaixos.Limite + 1; criacao++)
        {
            var visitante = CriarVisitante();
            visitante.DefaultRequestHeaders.Add("X-Forwarded-For", $"203.0.113.{100 + criacao}");
            visitante.DefaultRequestHeaders.Add("X-Forwarded-Proto", "https");
            respostas.Add((await visitante.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" })).StatusCode);
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, respostas.Last());
    }

    [Fact]
    public async Task Sem_a_configuracao_o_cookie_nao_ganha_Secure_so_porque_o_cabecalho_diz_https()
    {
        var visitante = CriarVisitante();
        visitante.DefaultRequestHeaders.Add("X-Forwarded-Proto", "https");

        var resposta = await visitante.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" });

        var cookie = Assert.Single(resposta.Headers.GetValues("Set-Cookie"), x => x.StartsWith("visitante="));
        Assert.DoesNotContain("secure", cookie, StringComparison.OrdinalIgnoreCase);
    }
}

public class ConfiguracaoDoProxyReversoTestes
{
    private static ForwardedHeadersOptions Registrar(Dictionary<string, string?> valores)
    {
        var configuracao = new ConfigurationBuilder().AddInMemoryCollection(valores).Build();
        var servicos = new ServiceCollection().AddSingleton<IConfiguration>(configuracao).AddProxyReverso();
        return servicos.BuildServiceProvider().GetRequiredService<IOptions<ForwardedHeadersOptions>>().Value;
    }

    [Fact]
    public void Desligado_ignora_a_lista_mesmo_com_valores_invalidos_e_nao_liga_nenhum_cabecalho()
    {
        var opcoes = Registrar(new() { ["ProxyReverso:Ativo"] = "false", ["ProxyReverso:IPsConfiaveis:0"] = "isso-nao-e-ip" });

        Assert.Equal(Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.None, opcoes.ForwardedHeaders);
    }

    [Fact]
    public void Ligado_com_IP_invalido_falha_na_inicializacao_com_mensagem_clara()
    {
        var erro = Assert.Throws<InvalidOperationException>(() =>
            Registrar(new() { ["ProxyReverso:Ativo"] = "true", ["ProxyReverso:IPsConfiaveis:0"] = "isso-nao-e-ip" }));

        Assert.Contains("IPsConfiaveis", erro.Message);
    }

    [Fact]
    public void Ligado_com_rede_invalida_falha_na_inicializacao_com_mensagem_clara()
    {
        var erro = Assert.Throws<InvalidOperationException>(() =>
            Registrar(new() { ["ProxyReverso:Ativo"] = "true", ["ProxyReverso:RedesConfiaveis:0"] = "10.0.0.0" }));

        Assert.Contains("RedesConfiaveis", erro.Message);
    }

    [Fact]
    public void Ligado_com_IPs_e_redes_validos_confia_so_neles_alem_do_proprio_servidor()
    {
        var opcoes = Registrar(new()
        {
            ["ProxyReverso:Ativo"] = "true",
            ["ProxyReverso:IPsConfiaveis:0"] = "10.1.1.5",
            ["ProxyReverso:IPsConfiaveis:1"] = "2001:db8::1",
            ["ProxyReverso:RedesConfiaveis:0"] = "10.0.0.0/8"
        });

        Assert.Contains(System.Net.IPAddress.Parse("10.1.1.5"), opcoes.KnownProxies);
        Assert.Contains(System.Net.IPAddress.Parse("2001:db8::1"), opcoes.KnownProxies);
        Assert.Contains(System.Net.IPNetwork.Parse("10.0.0.0/8"), opcoes.KnownIPNetworks);
        Assert.Contains(System.Net.IPNetwork.Parse("127.0.0.0/8"), opcoes.KnownIPNetworks);
        Assert.Equal(Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto, opcoes.ForwardedHeaders);
    }

    [Fact]
    public void Ligado_com_limite_de_proxies_zero_falha()
    {
        Assert.Throws<InvalidOperationException>(() =>
            Registrar(new() { ["ProxyReverso:Ativo"] = "true", ["ProxyReverso:LimiteDeProxies"] = "0" }));
    }
}
