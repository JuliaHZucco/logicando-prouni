using System.Net;
using Microsoft.Extensions.Configuration;
using QuizProuni.Api.Compartilhado.Configuracao;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Configuracao;

public class EnderecoPublicoFormatoTestes
{
    private static string? Ler(string? valor)
    {
        var configuracao = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["EnderecoPublico"] = valor })
            .Build();
        return configuracao.LerEnderecoPublico();
    }

    [Theory]
    [InlineData("https://prouni.feevale.br", "https://prouni.feevale.br")]
    [InlineData("https://prouni.feevale.br/", "https://prouni.feevale.br")]
    [InlineData("  https://prouni.feevale.br/  ", "https://prouni.feevale.br")]
    [InlineData("HTTPS://PROUNI.Feevale.br:443/", "https://prouni.feevale.br")]
    [InlineData("http://10.1.1.5:8080", "http://10.1.1.5:8080")]
    public void Endereco_valido_vem_normalizado_sem_barra_no_fim(string configurado, string esperado)
    {
        Assert.Equal(esperado, Ler(configurado));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Em_branco_significa_que_nao_esta_configurado(string? configurado)
    {
        Assert.Null(Ler(configurado));
    }

    [Theory]
    [InlineData("prouni.feevale.br")]
    [InlineData("ftp://prouni.feevale.br")]
    [InlineData("https://")]
    [InlineData("https://prouni.feevale.br/caminho")]
    [InlineData("https://prouni.feevale.br/?a=1")]
    [InlineData("https://prouni.feevale.br/#topo")]
    [InlineData("https://usuario:senha@prouni.feevale.br")]
    public void Endereco_invalido_falha_com_mensagem_que_diz_o_formato_certo(string configurado)
    {
        var erro = Assert.Throws<InvalidOperationException>(() => Ler(configurado));

        Assert.Contains("EnderecoPublico", erro.Message);
        Assert.Contains("https://prouni.feevale.br", erro.Message);
    }
}

public class EnderecoPublicoNaoConfiguradoTestes : TestesDeApi
{
    public EnderecoPublicoNaoConfiguradoTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Sem_configuracao_a_API_devolve_null_e_o_QR_usa_o_endereco_do_navegador()
    {
        var resposta = await CriarVisitante().GetAsync("/api/configuracao/publica");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        var corpo = await LerJsonAsync(resposta);
        Assert.Equal(System.Text.Json.JsonValueKind.Null, corpo.GetProperty("enderecoPublico").ValueKind);
    }

    [Fact]
    public async Task Consultar_o_endereco_nao_cria_visitante_nem_deixa_cookie()
    {
        var resposta = await CriarVisitante().GetAsync("/api/configuracao/publica");

        Assert.False(resposta.Headers.Contains("Set-Cookie"));
    }
}

public class EnderecoPublicoConfiguradoTestes : TestesDeApi, IClassFixture<FabricaComEnderecoPublico>
{
    public EnderecoPublicoConfiguradoTestes(FabricaComEnderecoPublico fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Configurado_a_API_devolve_o_endereco_normalizado()
    {
        var resposta = await CriarVisitante().GetAsync("/api/configuracao/publica");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        var corpo = await LerJsonAsync(resposta);
        Assert.Equal("https://prouni.exemplo.test", corpo.GetProperty("enderecoPublico").GetString());
    }
}

public class EnderecoPublicoInvalidoNaInicializacaoTestes
{
    [Fact]
    public void Endereco_invalido_impede_o_site_de_subir_e_a_mensagem_diz_qual_configuracao_esta_errada()
    {
        using var fabrica = new FabricaComEnderecoPublicoInvalido();

        var erro = Record.Exception(() => fabrica.CreateClient());

        Assert.NotNull(erro);
        var mensagens = new List<string>();
        for (var atual = erro; atual != null; atual = atual.InnerException)
            mensagens.Add(atual.Message);
        Assert.Contains(mensagens, x => x.Contains("EnderecoPublico inválido"));
    }
}
