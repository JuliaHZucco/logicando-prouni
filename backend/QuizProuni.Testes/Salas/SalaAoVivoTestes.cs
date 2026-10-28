using System.Net.Http.Json;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Salas;

public class SalaAoVivoTestes : TestesDeApi
{
    public SalaAoVivoTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    private async Task<(ClienteDeTeste Moderador, HubConnection ConexaoDoModerador, string Codigo)> PrepararSalaAsync(int quantidade = 2, int? segundos = null)
    {
        var moderador = await CriarModeradorLogadoAsync();
        var codigo = await CriarSalaAsync(moderador, quantidade, segundos);
        var conexao = await ConectarAsync(moderador);
        Assert.True(await InvocarAsync(conexao, "EntrarSala", codigo));
        return (moderador, conexao, codigo);
    }

    private async Task<(ClienteDeTeste Cliente, HubConnection Conexao)> EntrarComoParticipanteAsync(string codigo, string apelido)
    {
        var cliente = CriarVisitante();
        await EntrarNaSalaAsync(cliente, codigo, apelido);
        var conexao = await ConectarAsync(cliente);
        Assert.True(await InvocarAsync(conexao, "EntrarSala", codigo));
        return (cliente, conexao);
    }

    [Fact]
    public async Task Estranho_nao_consegue_entrar_no_canal_da_sala()
    {
        var (_, _, codigo) = await PrepararSalaAsync();
        var estranho = await ConectarAsync(CriarVisitante());

        var entrou = await InvocarAsync(estranho, "EntrarSala", codigo);

        Assert.False(entrou);
    }

    [Fact]
    public async Task Entrada_de_participante_avisa_a_sala_com_a_lista_de_apelidos()
    {
        var (_, conexaoDoModerador, codigo) = await PrepararSalaAsync();
        var aviso = AguardarEventoAsync(conexaoDoModerador, "participante-entrou");

        await EntrarNaSalaAsync(CriarVisitante(), codigo, "Ana");

        var evento = await aviso;
        Assert.Equal(1, evento.GetProperty("total").GetInt32());
        Assert.Equal("Ana", evento.GetProperty("participantes")[0].GetProperty("apelido").GetString());
    }

    [Fact]
    public async Task Ciclo_completo_da_pergunta_ate_o_podio_e_encerramento()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync(quantidade: 2);
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        var (_, bruno) = await EntrarComoParticipanteAsync(codigo, "Bruno");

        var iniciada = AguardarEventoAsync(ana, "pergunta-iniciada");
        Assert.True(await InvocarAsync(moderador, "Avancar", codigo));
        var pergunta = await iniciada;
        Assert.Equal(1, pergunta.GetProperty("ordem").GetInt32());
        Assert.Equal(2, pergunta.GetProperty("total").GetInt32());
        Assert.Equal(4, pergunta.GetProperty("alternativas").GetArrayLength());
        Assert.False(pergunta.GetProperty("alternativas")[0].TryGetProperty("correta", out _));

        var respostaRegistrada = AguardarEventoAsync(moderador, "resposta-registrada");
        Assert.True(await InvocarAsync(ana, "Responder", codigo, await ObterAlternativaDaSalaAsync(codigo, 1, correta: true)));
        Assert.Equal(1, (await respostaRegistrada).GetProperty("respondidas").GetInt32());
        Assert.True(await InvocarAsync(bruno, "Responder", codigo, await ObterAlternativaDaSalaAsync(codigo, 1, correta: false)));

        var encerrada = AguardarEventoAsync(ana, "resultado-disponivel");
        Assert.True(await InvocarAsync(moderador, "EncerrarPergunta", codigo));
        var resultado = await encerrada;
        Assert.Equal(2, resultado.GetProperty("totalRespostas").GetInt32());
        Assert.Equal(1, resultado.GetProperty("acertos").GetInt32());
        Assert.Equal(1, resultado.GetProperty("erros").GetInt32());
        Assert.Equal(0, resultado.GetProperty("naoResponderam").GetInt32());
        Assert.Equal(50, resultado.GetProperty("percentualAcerto").GetInt32());
        Assert.Equal(await ObterAlternativaDaSalaAsync(codigo, 1, correta: true), resultado.GetProperty("alternativaCorretaId").GetInt32());

        Assert.True(await InvocarAsync(moderador, "Avancar", codigo));
        Assert.True(await InvocarAsync(ana, "Responder", codigo, await ObterAlternativaDaSalaAsync(codigo, 2, correta: true)));
        Assert.True(await InvocarAsync(moderador, "EncerrarPergunta", codigo));

        var ranking = AguardarEventoAsync(bruno, "quiz-finalizado");
        Assert.True(await InvocarAsync(moderador, "Avancar", codigo));
        var podio = (await ranking).GetProperty("ranking");
        Assert.Equal("Ana", podio[0].GetProperty("apelido").GetString());
        Assert.Equal(1, podio[0].GetProperty("posicao").GetInt32());
        Assert.Equal(2, podio[0].GetProperty("acertos").GetInt32());
        Assert.Equal(100, podio[0].GetProperty("aproveitamento").GetInt32());
        Assert.Equal("Bruno", podio[1].GetProperty("apelido").GetString());
        Assert.Equal(2, podio[1].GetProperty("posicao").GetInt32());

        var encerramento = AguardarEventoAsync(ana, "quiz-finalizado");
        Assert.True(await InvocarAsync(moderador, "EncerrarSala", codigo));
        await encerramento;
    }

    [Fact]
    public async Task Fim_da_pergunta_avisa_com_pergunta_encerrada_e_depois_com_resultado_disponivel()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync();
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);
        var encerrada = AguardarEventoAsync(ana, "pergunta-encerrada");
        var resultado = AguardarEventoAsync(ana, "resultado-disponivel");

        await InvocarAsync(moderador, "EncerrarPergunta", codigo);

        Assert.Equal(1, (await encerrada).GetProperty("ordem").GetInt32());
        Assert.Equal(4, (await resultado).GetProperty("grafico").GetArrayLength());
    }

    [Fact]
    public async Task Quiz_finalizado_distingue_o_ranking_final_do_encerramento_da_sala()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync(quantidade: 1);
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);
        await InvocarAsync(moderador, "EncerrarPergunta", codigo);

        var ranking = AguardarEventoAsync(ana, "quiz-finalizado");
        await InvocarAsync(moderador, "Avancar", codigo);
        Assert.False((await ranking).GetProperty("encerrada").GetBoolean());

        var encerramento = AguardarEventoAsync(ana, "quiz-finalizado");
        await InvocarAsync(moderador, "EncerrarSala", codigo);
        Assert.True((await encerramento).GetProperty("encerrada").GetBoolean());
    }

    [Fact]
    public async Task Resposta_duplicada_e_resposta_depois_do_fim_da_pergunta_sao_recusadas()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync();
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);
        var certa = await ObterAlternativaDaSalaAsync(codigo, 1, correta: true);
        var errada = await ObterAlternativaDaSalaAsync(codigo, 1, correta: false);

        var primeira = await InvocarAsync(ana, "Responder", codigo, certa);
        var segunda = await InvocarAsync(ana, "Responder", codigo, errada);
        await InvocarAsync(moderador, "EncerrarPergunta", codigo);
        var (_, bruno) = await EntrarComoParticipanteAsync(codigo, "Bruno");
        var tardia = await InvocarAsync(bruno, "Responder", codigo, certa);

        Assert.True(primeira);
        Assert.False(segunda);
        Assert.False(tardia);
        var gravadas = await UsarBancoAsync(db => db.Respostas.CountAsync(x => db.Participantes.Any(p => p.ParticipanteId == x.ParticipanteId && db.Salas.Any(s => s.Codigo == codigo && s.SalaId == p.SalaId))));
        Assert.Equal(1, gravadas);
    }

    [Fact]
    public async Task Resposta_com_alternativa_de_outra_pergunta_e_recusada()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync();
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);
        var daSegundaPergunta = await ObterAlternativaDaSalaAsync(codigo, 2, correta: true);

        var aceita = await InvocarAsync(ana, "Responder", codigo, daSegundaPergunta);

        Assert.False(aceita);
    }

    [Fact]
    public async Task Participante_nao_pode_avancar_encerrar_nem_abrir_nova_rodada()
    {
        var (_, _, codigo) = await PrepararSalaAsync();
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");

        Assert.False(await InvocarAsync(ana, "Avancar", codigo));
        Assert.False(await InvocarAsync(ana, "EncerrarPergunta", codigo));
        Assert.False(await InvocarAsync(ana, "JogarNovamente", codigo));
        Assert.False(await InvocarAsync(ana, "EncerrarSala", codigo));
    }

    [Fact]
    public async Task Outro_moderador_nao_controla_a_sala()
    {
        var (_, _, codigo) = await PrepararSalaAsync();
        var intruso = await ConectarAsync(await CriarModeradorLogadoAsync());

        Assert.False(await InvocarAsync(intruso, "Avancar", codigo));
        Assert.False(await InvocarAsync(intruso, "EncerrarSala", codigo));
    }

    [Fact]
    public async Task Nao_avanca_com_pergunta_aberta_e_nao_encerra_pergunta_que_nao_esta_aberta()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync();

        Assert.False(await InvocarAsync(moderador, "EncerrarPergunta", codigo));
        Assert.True(await InvocarAsync(moderador, "Avancar", codigo));
        Assert.False(await InvocarAsync(moderador, "Avancar", codigo));
    }

    [Fact]
    public async Task Jogar_novamente_so_depois_do_ranking_abre_nova_rodada_com_placar_zerado_e_preserva_as_respostas()
    {
        var (moderadorHttp, moderador, codigo) = await PrepararSalaAsync(quantidade: 1);
        var (anaCliente, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        Assert.False(await InvocarAsync(moderador, "JogarNovamente", codigo));

        await InvocarAsync(moderador, "Avancar", codigo);
        await InvocarAsync(ana, "Responder", codigo, await ObterAlternativaDaSalaAsync(codigo, 1, correta: true));
        await InvocarAsync(moderador, "EncerrarPergunta", codigo);
        await InvocarAsync(moderador, "Avancar", codigo);

        var novaRodada = AguardarEventoAsync(ana, "nova-rodada");
        Assert.True(await InvocarAsync(moderador, "JogarNovamente", codigo));
        Assert.Equal(2, (await novaRodada).GetProperty("rodada").GetInt32());

        var estado = await LerJsonAsync(await anaCliente.GetAsync($"/api/salas/{codigo}/estado"));
        Assert.Equal("aguardando", estado.GetProperty("status").GetString());
        Assert.Equal(2, estado.GetProperty("rodada").GetInt32());

        await InvocarAsync(moderador, "Avancar", codigo);
        Assert.True(await InvocarAsync(ana, "Responder", codigo, await ObterAlternativaDaSalaAsync(codigo, 1, correta: false)));
        var respostasGuardadas = await UsarBancoAsync(db => db.Respostas.CountAsync(x => db.Participantes.Any(p => p.ParticipanteId == x.ParticipanteId && p.Apelido == "Ana" && db.Salas.Any(s => s.Codigo == codigo && s.SalaId == p.SalaId))));
        Assert.Equal(2, respostasGuardadas);

        await InvocarAsync(moderador, "EncerrarPergunta", codigo);
        await InvocarAsync(moderador, "Avancar", codigo);
        var ranking = await LerJsonAsync(await moderadorHttp.GetAsync($"/api/salas/{codigo}/ranking"));
        Assert.Equal(0, ranking[0].GetProperty("acertos").GetInt32());
    }

    [Fact]
    public async Task Moderador_encerra_a_sala_em_qualquer_estado_e_ela_para_de_aceitar_respostas()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync();
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);

        Assert.True(await InvocarAsync(moderador, "EncerrarSala", codigo));

        Assert.False(await InvocarAsync(ana, "Responder", codigo, await ObterAlternativaDaSalaAsync(codigo, 1, correta: true)));
        Assert.False(await InvocarAsync(moderador, "EncerrarSala", codigo));
        var abertas = await UsarBancoAsync(db => db.Exibicoes.CountAsync(x => x.DataEncerramento == null && db.SalaPerguntas.Any(sp => sp.SalaPerguntaId == x.SalaPerguntaId && db.Salas.Any(s => s.Codigo == codigo && s.SalaId == sp.SalaId))));
        Assert.Equal(0, abertas);
    }

    [Fact]
    public async Task Cronometro_encerra_a_pergunta_sozinho_quando_o_tempo_acaba()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync(quantidade: 1, segundos: 10);
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        var encerrada = AguardarEventoAsync(ana, "resultado-disponivel", segundosDeEspera: 20);

        await InvocarAsync(moderador, "Avancar", codigo);
        var resultado = await encerrada;

        Assert.Equal(1, resultado.GetProperty("naoResponderam").GetInt32());
        Assert.Equal(0, resultado.GetProperty("totalRespostas").GetInt32());
    }

    [Fact]
    public async Task Estado_da_pergunta_aberta_informa_a_resposta_ja_enviada_para_quem_recarrega_a_pagina()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync();
        var (anaCliente, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);
        var escolhida = await ObterAlternativaDaSalaAsync(codigo, 1, correta: false);
        await InvocarAsync(ana, "Responder", codigo, escolhida);

        var estado = await LerJsonAsync(await anaCliente.GetAsync($"/api/salas/{codigo}/estado"));

        Assert.Equal("pergunta_aberta", estado.GetProperty("status").GetString());
        Assert.Equal(escolhida, estado.GetProperty("minhaAlternativaId").GetInt32());
        Assert.Equal(4, estado.GetProperty("pergunta").GetProperty("alternativas").GetArrayLength());
        Assert.Equal(System.Text.Json.JsonValueKind.Null, estado.GetProperty("resultado").ValueKind);
    }

}
