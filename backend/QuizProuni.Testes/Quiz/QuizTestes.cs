using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Quiz;

public class QuizTestes : TestesDeApi
{
    public QuizTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Partida_aleatoria_devolve_perguntas_com_4_opcoes_sem_revelar_a_correta()
    {
        var cliente = CriarVisitante();

        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 5);

        var perguntas = partida.GetProperty("perguntas");
        Assert.Equal(5, perguntas.GetArrayLength());
        foreach (var pergunta in perguntas.EnumerateArray())
        {
            Assert.Equal(4, pergunta.GetProperty("opcoesResposta").GetArrayLength());
            Assert.False(pergunta.TryGetProperty("correta", out _));
            Assert.False(pergunta.TryGetProperty("duvidaResposta", out _));
            Assert.False(pergunta.GetProperty("opcoesResposta")[0].TryGetProperty("correta", out _));
        }
    }

    [Fact]
    public async Task Modo_categoria_so_traz_perguntas_da_categoria_escolhida()
    {
        var cliente = CriarVisitante();

        var partida = await IniciarPartidaAsync(cliente, "categoria", 5, new[] { "prazos" });

        var categorias = partida.GetProperty("perguntas").EnumerateArray().Select(x => x.GetProperty("categoriaId").GetString());
        Assert.All(categorias, categoriaId => Assert.Equal("prazos", categoriaId));
    }

    [Fact]
    public async Task Modo_misto_traz_ao_menos_uma_pergunta_de_cada_categoria_escolhida()
    {
        var cliente = CriarVisitante();
        var escolhidas = new[] { "prazos", "documentacao", "elegibilidade" };

        var partida = await IniciarPartidaAsync(cliente, "misto", 3, escolhidas);

        var categorias = partida.GetProperty("perguntas").EnumerateArray().Select(x => x.GetProperty("categoriaId").GetString()).ToList();
        Assert.Equal(escolhidas.OrderBy(x => x), categorias.OrderBy(x => x));
    }

    [Theory]
    [InlineData("aleatorio", 0, new string[0])]
    [InlineData("aleatorio", 11, new string[0])]
    [InlineData("aleatorio", 5, new[] { "prazos" })]
    [InlineData("categoria", 5, new string[0])]
    [InlineData("categoria", 5, new[] { "prazos", "documentacao" })]
    [InlineData("misto", 5, new string[0])]
    [InlineData("misto", 2, new[] { "prazos", "documentacao", "elegibilidade" })]
    [InlineData("misto", 5, new[] { "categoria-que-nao-existe" })]
    [InlineData("outro", 5, new string[0])]
    public async Task Configuracao_invalida_devolve_400_com_mensagem(string modo, int quantidade, string[] categorias)
    {
        var cliente = CriarVisitante();

        var resposta = await cliente.PostAsJsonAsync("/api/quiz/partidas", new { modo, categorias, quantidade });
        var corpo = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(corpo.GetProperty("message").GetString()));
    }

    [Fact]
    public async Task Resposta_certa_e_errada_voltam_com_a_alternativa_correta_e_a_explicacao()
    {
        var cliente = CriarVisitante();
        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 2);
        var partidaId = partida.GetProperty("partidaId").GetInt32();
        var perguntas = partida.GetProperty("perguntas");
        var primeiraId = perguntas[0].GetProperty("duvidaId").GetString()!;
        var segundaId = perguntas[1].GetProperty("duvidaId").GetString()!;
        var certaDaPrimeira = await ObterAlternativaCorretaIdAsync(primeiraId);
        var erradaDaSegunda = await ObterAlternativaErradaIdAsync(segundaId);
        var certaDaSegunda = await ObterAlternativaCorretaIdAsync(segundaId);

        var acerto = await LerJsonAsync(await ResponderAsync(cliente, partidaId, primeiraId, certaDaPrimeira));
        var erro = await LerJsonAsync(await ResponderAsync(cliente, partidaId, segundaId, erradaDaSegunda));

        Assert.True(acerto.GetProperty("correta").GetBoolean());
        Assert.Equal(certaDaPrimeira, acerto.GetProperty("alternativaCorretaId").GetInt32());
        Assert.False(string.IsNullOrWhiteSpace(acerto.GetProperty("explicacao").GetString()));
        Assert.False(erro.GetProperty("correta").GetBoolean());
        Assert.Equal(certaDaSegunda, erro.GetProperty("alternativaCorretaId").GetInt32());
    }

    [Fact]
    public async Task Responder_a_mesma_pergunta_duas_vezes_devolve_409()
    {
        var cliente = CriarVisitante();
        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 2);
        var partidaId = partida.GetProperty("partidaId").GetInt32();
        var perguntaId = partida.GetProperty("perguntas")[0].GetProperty("duvidaId").GetString()!;
        var certa = await ObterAlternativaCorretaIdAsync(perguntaId);
        var errada = await ObterAlternativaErradaIdAsync(perguntaId);

        var primeira = await ResponderAsync(cliente, partidaId, perguntaId, certa);
        var segunda = await ResponderAsync(cliente, partidaId, perguntaId, errada);
        var corpo = await LerJsonAsync(segunda);

        Assert.Equal(HttpStatusCode.OK, primeira.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, segunda.StatusCode);
        Assert.Equal("RespostaDuplicada", corpo.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Responder_com_alternativa_de_outra_pergunta_devolve_400()
    {
        var cliente = CriarVisitante();
        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 2);
        var partidaId = partida.GetProperty("partidaId").GetInt32();
        var perguntas = partida.GetProperty("perguntas");
        var alternativaDaOutra = await ObterAlternativaCorretaIdAsync(perguntas[1].GetProperty("duvidaId").GetString()!);

        var resposta = await ResponderAsync(cliente, partidaId, perguntas[0].GetProperty("duvidaId").GetString()!, alternativaDaOutra);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task Partida_de_outro_visitante_devolve_404()
    {
        var dono = CriarVisitante();
        var intruso = CriarVisitante();
        var partida = await IniciarPartidaAsync(dono, "aleatorio", 1);
        var partidaId = partida.GetProperty("partidaId").GetInt32();
        var perguntaId = partida.GetProperty("perguntas")[0].GetProperty("duvidaId").GetString()!;
        var certa = await ObterAlternativaCorretaIdAsync(perguntaId);

        var resposta = await ResponderAsync(intruso, partidaId, perguntaId, certa);

        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);
    }

    [Fact]
    public async Task Partida_termina_quando_todas_as_perguntas_foram_respondidas()
    {
        var cliente = CriarVisitante();
        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 2);
        var partidaId = partida.GetProperty("partidaId").GetInt32();

        foreach (var pergunta in partida.GetProperty("perguntas").EnumerateArray())
        {
            var perguntaId = pergunta.GetProperty("duvidaId").GetString()!;
            await ResponderAsync(cliente, partidaId, perguntaId, await ObterAlternativaCorretaIdAsync(perguntaId));
        }

        var dataFim = await UsarBancoAsync(db => db.PartidasIndividuais
            .Where(x => x.PartidaIndividualId == partidaId)
            .Select(x => x.DataFim)
            .FirstAsync());
        Assert.NotNull(dataFim);
    }

    [Fact]
    public async Task Jogar_novamente_repete_as_mesmas_perguntas_na_mesma_ordem_em_uma_nova_partida()
    {
        var cliente = CriarVisitante();
        var original = await IniciarPartidaAsync(cliente, "aleatorio", 5);
        var originalId = original.GetProperty("partidaId").GetInt32();

        var resposta = await cliente.PostAsJsonAsync("/api/quiz/partidas", new { repetirPartidaId = originalId });
        var repetida = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.Created, resposta.StatusCode);
        Assert.NotEqual(originalId, repetida.GetProperty("partidaId").GetInt32());
        Assert.Equal(
            original.GetProperty("perguntas").EnumerateArray().Select(x => x.GetProperty("duvidaId").GetString()),
            repetida.GetProperty("perguntas").EnumerateArray().Select(x => x.GetProperty("duvidaId").GetString()));
    }

    [Fact]
    public async Task Jogar_novamente_permite_responder_de_novo_sem_apagar_a_tentativa_anterior()
    {
        var cliente = CriarVisitante();
        var original = await IniciarPartidaAsync(cliente, "aleatorio", 1);
        var originalId = original.GetProperty("partidaId").GetInt32();
        var perguntaId = original.GetProperty("perguntas")[0].GetProperty("duvidaId").GetString()!;
        var certa = await ObterAlternativaCorretaIdAsync(perguntaId);
        await ResponderAsync(cliente, originalId, perguntaId, certa);

        var repetida = await LerJsonAsync(await cliente.PostAsJsonAsync("/api/quiz/partidas", new { repetirPartidaId = originalId }));
        var repetidaId = repetida.GetProperty("partidaId").GetInt32();
        var segundaTentativa = await ResponderAsync(cliente, repetidaId, perguntaId, certa);

        Assert.Equal(HttpStatusCode.OK, segundaTentativa.StatusCode);
        var respostasGravadas = await UsarBancoAsync(db => db.RespostasIndividuais
            .CountAsync(x => x.PartidaIndividualId == originalId || x.PartidaIndividualId == repetidaId));
        Assert.Equal(2, respostasGravadas);
    }

    [Fact]
    public async Task Jogar_novamente_com_partida_de_outro_visitante_devolve_404()
    {
        var dono = CriarVisitante();
        var intruso = CriarVisitante();
        var partida = await IniciarPartidaAsync(dono, "aleatorio", 1);

        var resposta = await intruso.PostAsJsonAsync("/api/quiz/partidas", new { repetirPartidaId = partida.GetProperty("partidaId").GetInt32() });

        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);
    }

    private async Task ResponderTudoAsync(HttpClient cliente, JsonElement partida, params bool[] acertar)
    {
        var partidaId = partida.GetProperty("partidaId").GetInt32();
        var perguntas = partida.GetProperty("perguntas");
        for (var indice = 0; indice < acertar.Length; indice++)
        {
            var perguntaId = perguntas[indice].GetProperty("duvidaId").GetString()!;
            var alternativaId = acertar[indice]
                ? await ObterAlternativaCorretaIdAsync(perguntaId)
                : await ObterAlternativaErradaIdAsync(perguntaId);
            await ResponderAsync(cliente, partidaId, perguntaId, alternativaId);
        }
    }

    [Fact]
    public async Task Resultado_da_partida_lista_cada_pergunta_com_acertou_ou_errou_e_o_necessario_para_reler()
    {
        var cliente = CriarVisitante();
        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 3);
        await ResponderTudoAsync(cliente, partida, true, false, true);
        var partidaId = partida.GetProperty("partidaId").GetInt32();

        var resposta = await cliente.GetAsync($"/api/quiz/partidas/{partidaId}/resultado");
        var resultado = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.True(resultado.GetProperty("finalizada").GetBoolean());
        Assert.Equal(3, resultado.GetProperty("totalPerguntas").GetInt32());
        Assert.Equal(2, resultado.GetProperty("acertos").GetInt32());
        Assert.Equal(67, resultado.GetProperty("percentualAcerto").GetInt32());
        Assert.True(resultado.GetProperty("aproveitamentoPositivo").GetBoolean());
        var itens = resultado.GetProperty("itens");
        Assert.Equal(new bool?[] { true, false, true }, itens.EnumerateArray().Select(x => (bool?)x.GetProperty("correta").GetBoolean()).ToArray());
        Assert.Equal(partida.GetProperty("perguntas")[1].GetProperty("duvidaId").GetString(), itens[1].GetProperty("duvidaId").GetString());
        Assert.False(string.IsNullOrEmpty(itens[0].GetProperty("baseDuvidaId").GetString()));
        Assert.False(string.IsNullOrEmpty(itens[0].GetProperty("categoriaId").GetString()));
    }

    [Fact]
    public async Task Exatamente_50_por_cento_de_aproveitamento_nao_e_positivo()
    {
        var cliente = CriarVisitante();
        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 2);
        await ResponderTudoAsync(cliente, partida, true, false);

        var resultado = await LerJsonAsync(await cliente.GetAsync($"/api/quiz/partidas/{partida.GetProperty("partidaId").GetInt32()}/resultado"));

        Assert.Equal(50, resultado.GetProperty("percentualAcerto").GetInt32());
        Assert.False(resultado.GetProperty("aproveitamentoPositivo").GetBoolean());
    }

    [Fact]
    public async Task Resultado_de_partida_em_andamento_marca_as_perguntas_sem_resposta_como_nulas()
    {
        var cliente = CriarVisitante();
        var partida = await IniciarPartidaAsync(cliente, "aleatorio", 3);
        await ResponderTudoAsync(cliente, partida, true);

        var resultado = await LerJsonAsync(await cliente.GetAsync($"/api/quiz/partidas/{partida.GetProperty("partidaId").GetInt32()}/resultado"));

        Assert.False(resultado.GetProperty("finalizada").GetBoolean());
        Assert.Equal(1, resultado.GetProperty("acertos").GetInt32());
        Assert.Equal(System.Text.Json.JsonValueKind.Null, resultado.GetProperty("itens")[1].GetProperty("correta").ValueKind);
    }

    [Fact]
    public async Task Resultado_de_partida_de_outro_visitante_ou_sem_cookie_devolve_404()
    {
        var dono = CriarVisitante();
        var partida = await IniciarPartidaAsync(dono, "aleatorio", 1);
        var caminho = $"/api/quiz/partidas/{partida.GetProperty("partidaId").GetInt32()}/resultado";

        var deOutro = await CriarVisitante().GetAsync(caminho);
        var semNada = await CriarVisitante().GetAsync("/api/quiz/partidas/999999999/resultado");

        Assert.Equal(HttpStatusCode.NotFound, deOutro.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, semNada.StatusCode);
    }
}
