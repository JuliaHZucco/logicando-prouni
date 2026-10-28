using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Salas;

public class SalasTestes : TestesDeApi
{
    public SalasTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Criar_sala_sem_login_devolve_401()
    {
        var visitante = CriarVisitante();

        var resposta = await visitante.PostAsJsonAsync("/api/salas", new { nome = "Sala", modo = "aleatorio", categorias = new string[0], quantidade = 3 });

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Criar_sala_gera_codigo_de_6_caracteres_do_alfabeto_permitido_com_perguntas_e_alternativas_embaralhadas()
    {
        var moderador = await CriarModeradorLogadoAsync();

        var codigo = await CriarSalaAsync(moderador, quantidade: 3, segundosPorPergunta: 20);

        Assert.Matches("^[A-HJ-NP-Z2-9]{6}$", codigo);
        var (perguntas, alternativas, usaCronometro) = await UsarBancoAsync(async db =>
        {
            var sala = await db.Salas.FirstAsync(x => x.Codigo == codigo);
            var salaPerguntasIds = await db.SalaPerguntas.Where(x => x.SalaId == sala.SalaId).Select(x => x.SalaPerguntaId).ToListAsync();
            var posicionadas = await db.SalaPerguntaAlternativas.CountAsync(x => salaPerguntasIds.Contains(x.SalaPerguntaId));
            return (salaPerguntasIds.Count, posicionadas, sala.UsaCronometro);
        });
        Assert.Equal(3, perguntas);
        Assert.Equal(12, alternativas);
        Assert.True(usaCronometro);
    }

    [Theory]
    [InlineData("", "aleatorio", 3, null)]
    [InlineData("   ", "aleatorio", 3, null)]
    [InlineData("Sala", "aleatorio", 0, null)]
    [InlineData("Sala", "aleatorio", 11, null)]
    [InlineData("Sala", "aleatorio", 3, 9)]
    [InlineData("Sala", "aleatorio", 3, 61)]
    [InlineData("Sala", "categoria", 3, null)]
    public async Task Criar_sala_com_configuracao_invalida_devolve_400(string nome, string modo, int quantidade, int? segundos)
    {
        var moderador = await CriarModeradorLogadoAsync();

        var resposta = await moderador.PostAsJsonAsync("/api/salas", new { nome, modo, categorias = new string[0], quantidade, segundosPorPergunta = segundos });

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task Criar_sala_no_modo_misto_exige_uma_pergunta_por_categoria()
    {
        var moderador = await CriarModeradorLogadoAsync();

        var resposta = await moderador.PostAsJsonAsync("/api/salas", new
        {
            nome = "Sala",
            modo = "misto",
            categorias = new[] { "prazos", "documentacao", "elegibilidade" },
            quantidade = 2
        });

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task Minhas_salas_lista_so_as_do_moderador_e_filtra_pelo_nome()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var outroModerador = await CriarModeradorLogadoAsync();
        var codigoDaTurma = await CriarSalaAsync(moderador, nome: "Turma Alfa");
        await CriarSalaAsync(moderador, nome: "Turma Beta");
        await CriarSalaAsync(outroModerador, nome: "Turma Alfa do outro");

        var todas = await LerJsonAsync(await moderador.GetAsync("/api/salas/minhas"));
        var filtradas = await LerJsonAsync(await moderador.GetAsync("/api/salas/minhas?busca=alfa"));

        Assert.Equal(2, todas.GetArrayLength());
        Assert.Equal(1, filtradas.GetArrayLength());
        Assert.Equal(codigoDaTurma, filtradas[0].GetProperty("codigo").GetString());
        Assert.Equal("aguardando", filtradas[0].GetProperty("status").GetString());
    }

    private async Task<string> CriarSalaNoEstadoAsync(HttpClient moderador, string nome, string status)
    {
        var codigo = await CriarSalaAsync(moderador, nome: nome);
        await UsarBancoAsync(async db =>
        {
            var sala = await db.Salas.FirstAsync(x => x.Codigo == codigo);
            sala.Status = status;
            sala.PerguntaAtual = status == "aguardando" ? null : (short)1;
            sala.DataEncerramento = status == "encerrada" ? DateTimeOffset.UtcNow : null;
            await db.SaveChangesAsync();
            return 0;
        });
        return codigo;
    }

    private static async Task<string[]> ListarCodigosAsync(HttpClient moderador, string consulta)
    {
        var resposta = await moderador.GetAsync($"/api/salas/minhas{consulta}");
        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        return (await LerJsonAsync(resposta)).EnumerateArray().Select(x => x.GetProperty("codigo").GetString()!).ToArray();
    }

    [Fact]
    public async Task Filtro_de_estado_separa_aguardando_em_andamento_e_encerrada()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var aguardando = await CriarSalaNoEstadoAsync(moderador, "Sala A", "aguardando");
        var perguntaAberta = await CriarSalaNoEstadoAsync(moderador, "Sala B", "pergunta_aberta");
        var resultado = await CriarSalaNoEstadoAsync(moderador, "Sala C", "resultado_pergunta");
        var ranking = await CriarSalaNoEstadoAsync(moderador, "Sala D", "ranking");
        var encerrada = await CriarSalaNoEstadoAsync(moderador, "Sala E", "encerrada");

        Assert.Equal(new[] { aguardando }, await ListarCodigosAsync(moderador, "?estado=aguardando"));
        Assert.Equal(new[] { perguntaAberta, resultado, ranking }.OrderBy(x => x), (await ListarCodigosAsync(moderador, "?estado=em_andamento")).OrderBy(x => x));
        Assert.Equal(new[] { encerrada }, await ListarCodigosAsync(moderador, "?estado=encerrada"));
        Assert.Equal(5, (await ListarCodigosAsync(moderador, "")).Length);
        Assert.Equal(5, (await ListarCodigosAsync(moderador, "?estado=")).Length);
    }

    [Fact]
    public async Task Filtro_de_estado_combina_com_a_busca_pelo_nome()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var andamentoDaTurma = await CriarSalaNoEstadoAsync(moderador, "Turma Azul", "ranking");
        await CriarSalaNoEstadoAsync(moderador, "Turma Azul antiga", "encerrada");
        await CriarSalaNoEstadoAsync(moderador, "Outra sala", "ranking");

        var codigos = await ListarCodigosAsync(moderador, "?estado=em_andamento&busca=azul");

        Assert.Equal(new[] { andamentoDaTurma }, codigos);
    }

    [Fact]
    public async Task Filtro_de_estado_invalido_devolve_400()
    {
        var moderador = await CriarModeradorLogadoAsync();

        var resposta = await moderador.GetAsync("/api/salas/minhas?estado=qualquer");

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task Ranking_geral_so_e_visto_pelo_moderador_dono()
    {
        var dono = await CriarModeradorLogadoAsync();
        var outro = await CriarModeradorLogadoAsync();
        var codigo = await CriarSalaAsync(dono);

        var doDono = await dono.GetAsync($"/api/salas/{codigo}/ranking");
        var doOutro = await outro.GetAsync($"/api/salas/{codigo}/ranking");
        var anonimo = await CriarVisitante().GetAsync($"/api/salas/{codigo}/ranking");

        Assert.Equal(HttpStatusCode.OK, doDono.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, doOutro.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, anonimo.StatusCode);
    }

    [Fact]
    public async Task Entrar_em_sala_que_nao_existe_devolve_404()
    {
        var participante = CriarVisitante();

        var resposta = await participante.PostAsJsonAsync("/api/salas/ZZZZZZ/participantes", new { apelido = "Ana" });

        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);
    }

    [Fact]
    public async Task Entrar_com_apelido_cria_o_participante_e_voltar_reconecta_sem_duplicar()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var codigo = await CriarSalaAsync(moderador);
        var ana = CriarVisitante();

        var primeira = await ana.PostAsJsonAsync($"/api/salas/{codigo}/participantes", new { apelido = "Ana" });
        var segunda = await ana.PostAsJsonAsync($"/api/salas/{codigo.ToLower()}/participantes", new { apelido = "Outro nome" });
        var corpoDaSegunda = await LerJsonAsync(segunda);

        Assert.Equal(HttpStatusCode.Created, primeira.StatusCode);
        Assert.Equal(HttpStatusCode.OK, segunda.StatusCode);
        Assert.True(corpoDaSegunda.GetProperty("reconectado").GetBoolean());
        Assert.Equal("Ana", corpoDaSegunda.GetProperty("participante").GetProperty("apelido").GetString());
        var total = await UsarBancoAsync(db => db.Participantes.CountAsync(x => db.Salas.Any(s => s.Codigo == codigo && s.SalaId == x.SalaId)));
        Assert.Equal(1, total);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Um apelido bem comprido demais")]
    public async Task Entrar_sem_apelido_valido_devolve_400_pedindo_apelido(string apelido)
    {
        var moderador = await CriarModeradorLogadoAsync();
        var codigo = await CriarSalaAsync(moderador);

        var resposta = await CriarVisitante().PostAsJsonAsync($"/api/salas/{codigo}/participantes", new { apelido });
        var corpo = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        Assert.Equal("PrecisaApelido", corpo.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Apelido_repetido_na_mesma_sala_devolve_409_sem_diferenciar_maiusculas()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var codigo = await CriarSalaAsync(moderador);
        await EntrarNaSalaAsync(CriarVisitante(), codigo, "Ana");

        var resposta = await CriarVisitante().PostAsJsonAsync($"/api/salas/{codigo}/participantes", new { apelido = "aNA" });
        var corpo = await LerJsonAsync(resposta);

        Assert.Equal(HttpStatusCode.Conflict, resposta.StatusCode);
        Assert.Equal("ApelidoEmUso", corpo.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Mesmo_apelido_em_salas_diferentes_e_permitido()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var primeiraSala = await CriarSalaAsync(moderador);
        var segundaSala = await CriarSalaAsync(moderador);
        await EntrarNaSalaAsync(CriarVisitante(), primeiraSala, "Ana");

        var resposta = await CriarVisitante().PostAsJsonAsync($"/api/salas/{segundaSala}/participantes", new { apelido = "Ana" });

        Assert.Equal(HttpStatusCode.Created, resposta.StatusCode);
    }

    [Fact]
    public async Task Sala_encerrada_nao_aceita_novos_participantes_mas_reconecta_quem_ja_entrou()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var codigo = await CriarSalaAsync(moderador);
        var quemJaEntrou = CriarVisitante();
        await EntrarNaSalaAsync(quemJaEntrou, codigo, "Ana");
        await UsarBancoAsync(async db =>
        {
            var sala = await db.Salas.FirstAsync(x => x.Codigo == codigo);
            sala.Status = "encerrada";
            sala.DataEncerramento = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();
            return 0;
        });

        var novo = await CriarVisitante().PostAsJsonAsync($"/api/salas/{codigo}/participantes", new { apelido = "Bruno" });
        var reconexao = await quemJaEntrou.PostAsJsonAsync($"/api/salas/{codigo}/participantes", new { });

        Assert.Equal(HttpStatusCode.Conflict, novo.StatusCode);
        Assert.Equal(HttpStatusCode.OK, reconexao.StatusCode);
    }

    [Fact]
    public async Task Estado_da_sala_so_e_visto_pelo_moderador_e_pelos_participantes()
    {
        var moderador = await CriarModeradorLogadoAsync();
        var codigo = await CriarSalaAsync(moderador, nome: "Turma do estado");
        var ana = CriarVisitante();
        await EntrarNaSalaAsync(ana, codigo, "Ana");

        var doModerador = await LerJsonAsync(await moderador.GetAsync($"/api/salas/{codigo}/estado"));
        var daAna = await LerJsonAsync(await ana.GetAsync($"/api/salas/{codigo}/estado"));
        var deEstranho = await CriarVisitante().GetAsync($"/api/salas/{codigo}/estado");
        var inexistente = await ana.GetAsync("/api/salas/ZZZZZZ/estado");

        Assert.True(doModerador.GetProperty("souModerador").GetBoolean());
        Assert.Equal("Turma do estado", doModerador.GetProperty("nome").GetString());
        Assert.False(daAna.GetProperty("souModerador").GetBoolean());
        Assert.Equal("Ana", daAna.GetProperty("participante").GetProperty("apelido").GetString());
        Assert.Equal(1, daAna.GetProperty("totalParticipantes").GetInt32());
        Assert.Equal(HttpStatusCode.Forbidden, deEstranho.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, inexistente.StatusCode);
    }
}
