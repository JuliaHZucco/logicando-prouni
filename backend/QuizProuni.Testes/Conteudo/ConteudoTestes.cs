using System.Net;
using System.Net.Http.Json;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Conteudo;

public class ConteudoTestes : TestesDeApi
{
    public ConteudoTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Conteudo_devolve_8_categorias_com_71_duvidas_no_total()
    {
        var cliente = CriarVisitante();

        var resposta = await cliente.GetAsync("/api/conteudo");
        var categorias = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal(8, categorias.GetArrayLength());
        Assert.Equal(71, categorias.EnumerateArray().Sum(x => x.GetProperty("categoriaDuvidas").GetArrayLength()));
        Assert.Equal("elegibilidade", categorias[0].GetProperty("categoriaId").GetString());
    }

    [Fact]
    public async Task Duvidas_vistas_comeca_vazia_e_lista_a_duvida_registrada()
    {
        var cliente = CriarVisitante();

        var antes = await LerJsonAsync(await cliente.GetAsync("/api/duvidas-vistas"));
        var registro = await cliente.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" });
        var repetido = await cliente.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1" });
        var depois = await LerJsonAsync(await cliente.GetAsync("/api/duvidas-vistas"));

        Assert.Equal(0, antes.GetArrayLength());
        Assert.Equal(HttpStatusCode.OK, registro.StatusCode);
        Assert.Equal(HttpStatusCode.OK, repetido.StatusCode);
        Assert.Equal(new[] { "eleg-1" }, depois.EnumerateArray().Select(x => x.GetString()).ToArray());
    }

    [Fact]
    public async Task Duvidas_vistas_sao_separadas_por_visitante()
    {
        var ana = CriarVisitante();
        var bruno = CriarVisitante();

        await ana.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-2" });
        var doBruno = await LerJsonAsync(await bruno.GetAsync("/api/duvidas-vistas"));

        Assert.Equal(0, doBruno.GetArrayLength());
    }

    [Fact]
    public async Task Duvida_vista_recusa_pergunta_derivada_com_404()
    {
        var cliente = CriarVisitante();

        var resposta = await cliente.PostAsJsonAsync("/api/duvidas-vistas", new { duvidaId = "eleg-1-detalhe-enem" });

        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);
    }
}
