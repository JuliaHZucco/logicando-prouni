using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Funcionalidades.Salas;

public static class PartidaAoVivoRegras
{
    private const int FolgaDoCronometroEmSegundos = 1;

    public static async Task<AvancarResponse> AvancarAsync(QuizProuniContext db, int moderadorId, string codigo, ILogger logger)
    {
        var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);

        try
        {
            await using var transacao = await db.Database.BeginTransactionAsync();

            var sala = await ConsultasDaSala.BuscarTravandoParaAlterarAsync(db, codigoNormalizado);
            var erro = ValidarDono<AvancarResponse>(sala, moderadorId);
            if (erro != null)
                return erro;

            if (sala!.Status != ConsultasDaSala.StatusAguardando && sala.Status != ConsultasDaSala.StatusResultadoPergunta)
                return RespostaBase.ComErro<AvancarResponse>("A sala não pode avançar agora.", TipoDeErro.Conflito, "EstadoInvalido");

            var perguntaAnterior = sala.PerguntaAtual ?? 0;
            if (perguntaAnterior >= sala.QuantidadePerguntas)
            {
                sala.Status = ConsultasDaSala.StatusRanking;
                await db.SaveChangesAsync();
                await transacao.CommitAsync();

                var ranking = await ConsultasDaSala.MontarRankingAsync(db, sala);
                return new AvancarResponse
                {
                    Codigo = sala.Codigo,
                    SalaId = sala.SalaId,
                    IrParaRanking = true,
                    Podio = ConsultasDaSala.MontarPodio(ranking)
                };
            }

            sala.Status = ConsultasDaSala.StatusPerguntaAberta;
            sala.PerguntaAtual = (short)(perguntaAnterior + 1);

            var salaPergunta = await db.SalaPerguntas.FirstAsync(x => x.SalaId == sala.SalaId && x.Ordem == sala.PerguntaAtual);
            db.Exibicoes.Add(new Exibicao
            {
                SalaPerguntaId = salaPergunta.SalaPerguntaId,
                Rodada = sala.RodadaAtual,
                DataAbertura = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
            await transacao.CommitAsync();

            var (_, pergunta) = await ConsultasDaSala.BuscarPerguntaAtualAsync(db, sala);
            return new AvancarResponse
            {
                Codigo = sala.Codigo,
                SalaId = sala.SalaId,
                SegundosPorPergunta = sala.SegundosPorPergunta,
                Pergunta = pergunta
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao avançar a sala. ModeradorId: {ModeradorId}, Codigo: {Codigo}", moderadorId, codigoNormalizado);
            return RespostaBase.ComErro<AvancarResponse>("Erro ao avançar a sala.");
        }
    }

    public static async Task<EncerrarPerguntaResponse> EncerrarPerguntaAsync(QuizProuniContext db, int? moderadorId, string codigo, ILogger logger)
    {
        var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);

        try
        {
            await using var transacao = await db.Database.BeginTransactionAsync();

            var sala = await ConsultasDaSala.BuscarTravandoParaAlterarAsync(db, codigoNormalizado);
            if (sala == null)
                return RespostaBase.ComErro<EncerrarPerguntaResponse>("Código de sala não encontrado.", TipoDeErro.NaoEncontrado);

            if (moderadorId != null && sala.ModeradorId != moderadorId)
                return RespostaBase.ComErro<EncerrarPerguntaResponse>("Só o moderador dono da sala pode fazer isso.", TipoDeErro.AcessoNegado);

            if (sala.Status != ConsultasDaSala.StatusPerguntaAberta)
                return RespostaBase.ComErro<EncerrarPerguntaResponse>("Não há pergunta aberta nesta sala.", TipoDeErro.Conflito, "EstadoInvalido");

            sala.Status = ConsultasDaSala.StatusResultadoPergunta;

            var salaPergunta = await db.SalaPerguntas.FirstAsync(x => x.SalaId == sala.SalaId && x.Ordem == sala.PerguntaAtual);
            var exibicao = await db.Exibicoes.FirstAsync(x => x.SalaPerguntaId == salaPergunta.SalaPerguntaId && x.Rodada == sala.RodadaAtual);
            exibicao.DataEncerramento = DateTimeOffset.UtcNow;

            await db.SaveChangesAsync();
            await transacao.CommitAsync();

            return new EncerrarPerguntaResponse
            {
                Codigo = sala.Codigo,
                Ordem = salaPergunta.Ordem,
                Resultado = await ConsultasDaSala.MontarResultadoAsync(db, sala, salaPergunta)
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao encerrar a pergunta. Codigo: {Codigo}", codigoNormalizado);
            return RespostaBase.ComErro<EncerrarPerguntaResponse>("Erro ao encerrar a pergunta.");
        }
    }

    public static async Task<EncerrarSalaResponse> EncerrarSalaAsync(QuizProuniContext db, int moderadorId, string codigo, ILogger logger)
    {
        var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);

        try
        {
            await using var transacao = await db.Database.BeginTransactionAsync();

            var sala = await ConsultasDaSala.BuscarTravandoParaAlterarAsync(db, codigoNormalizado);
            var erro = ValidarDono<EncerrarSalaResponse>(sala, moderadorId);
            if (erro != null)
                return erro;

            if (sala!.Status == ConsultasDaSala.StatusEncerrada)
                return RespostaBase.ComErro<EncerrarSalaResponse>("Esta sala já foi encerrada.", TipoDeErro.Conflito, "SalaEncerrada");

            var agora = DateTimeOffset.UtcNow;
            sala.Status = ConsultasDaSala.StatusEncerrada;
            sala.DataEncerramento = agora;

            var exibicoesAbertas = await (
                from exibicao in db.Exibicoes
                join salaPergunta in db.SalaPerguntas on exibicao.SalaPerguntaId equals salaPergunta.SalaPerguntaId
                where salaPergunta.SalaId == sala.SalaId && exibicao.DataEncerramento == null
                select exibicao
            ).ToListAsync();
            foreach (var exibicao in exibicoesAbertas)
                exibicao.DataEncerramento = agora;

            await db.SaveChangesAsync();
            await transacao.CommitAsync();

            var ranking = await ConsultasDaSala.MontarRankingAsync(db, sala);
            return new EncerrarSalaResponse { Codigo = sala.Codigo, Podio = ConsultasDaSala.MontarPodio(ranking) };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao encerrar a sala. ModeradorId: {ModeradorId}, Codigo: {Codigo}", moderadorId, codigoNormalizado);
            return RespostaBase.ComErro<EncerrarSalaResponse>("Erro ao encerrar a sala.");
        }
    }

    public static async Task<JogarNovamenteResponse> JogarNovamenteAsync(QuizProuniContext db, int moderadorId, string codigo, ILogger logger)
    {
        var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);

        try
        {
            await using var transacao = await db.Database.BeginTransactionAsync();

            var sala = await ConsultasDaSala.BuscarTravandoParaAlterarAsync(db, codigoNormalizado);
            var erro = ValidarDono<JogarNovamenteResponse>(sala, moderadorId);
            if (erro != null)
                return erro;

            if (sala!.Status != ConsultasDaSala.StatusRanking)
                return RespostaBase.ComErro<JogarNovamenteResponse>("Só é possível jogar novamente depois do ranking final.", TipoDeErro.Conflito, "EstadoInvalido");

            sala.Status = ConsultasDaSala.StatusAguardando;
            sala.PerguntaAtual = null;
            sala.RodadaAtual++;

            await db.SaveChangesAsync();
            await transacao.CommitAsync();

            return new JogarNovamenteResponse { Codigo = sala.Codigo, Rodada = sala.RodadaAtual };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao abrir nova rodada. ModeradorId: {ModeradorId}, Codigo: {Codigo}", moderadorId, codigoNormalizado);
            return RespostaBase.ComErro<JogarNovamenteResponse>("Erro ao abrir uma nova rodada.");
        }
    }

    public static async Task<RegistrarRespostaResponse> ResponderAsync(QuizProuniContext db, int visitanteId, string codigo, int alternativaId, ILogger logger)
    {
        var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);

        try
        {
            await using var transacao = await db.Database.BeginTransactionAsync();

            var sala = await ConsultasDaSala.BuscarTravandoParaLerAsync(db, codigoNormalizado);
            if (sala == null)
                return RespostaBase.ComErro<RegistrarRespostaResponse>("Código de sala não encontrado.", TipoDeErro.NaoEncontrado);

            var participante = await db.Participantes.FirstOrDefaultAsync(x => x.SalaId == sala.SalaId && x.VisitanteId == visitanteId);
            if (participante == null)
                return RespostaBase.ComErro<RegistrarRespostaResponse>("Entre na sala pelo código primeiro.", TipoDeErro.AcessoNegado);

            if (sala.Status != ConsultasDaSala.StatusPerguntaAberta)
                return RespostaBase.ComErro<RegistrarRespostaResponse>("Não há pergunta aberta para responder.", TipoDeErro.Conflito, "PerguntaFechada");

            var salaPergunta = await db.SalaPerguntas.FirstAsync(x => x.SalaId == sala.SalaId && x.Ordem == sala.PerguntaAtual);
            var exibicao = await db.Exibicoes.FirstAsync(x => x.SalaPerguntaId == salaPergunta.SalaPerguntaId && x.Rodada == sala.RodadaAtual);

            var tempoEsgotado = sala.SegundosPorPergunta != null
                && DateTimeOffset.UtcNow > exibicao.DataAbertura.AddSeconds(sala.SegundosPorPergunta.Value + FolgaDoCronometroEmSegundos);
            if (exibicao.DataEncerramento != null || tempoEsgotado)
                return RespostaBase.ComErro<RegistrarRespostaResponse>("O tempo desta pergunta acabou.", TipoDeErro.Conflito, "PerguntaFechada");

            var alternativa = await (
                from posicionada in db.SalaPerguntaAlternativas
                join candidata in db.Alternativas on posicionada.AlternativaId equals candidata.AlternativaId
                where posicionada.SalaPerguntaId == salaPergunta.SalaPerguntaId && candidata.AlternativaId == alternativaId
                select candidata
            ).FirstOrDefaultAsync();
            if (alternativa == null)
                return RespostaBase.ComErro<RegistrarRespostaResponse>("Alternativa inválida para esta pergunta.");

            var jaRespondeu = await db.Respostas.AnyAsync(x =>
                x.SalaPerguntaId == salaPergunta.SalaPerguntaId && x.Rodada == sala.RodadaAtual && x.ParticipanteId == participante.ParticipanteId);
            if (jaRespondeu)
                return RespostaDuplicada();

            db.Respostas.Add(new Resposta
            {
                SalaPerguntaId = salaPergunta.SalaPerguntaId,
                Rodada = sala.RodadaAtual,
                ParticipanteId = participante.ParticipanteId,
                AlternativaId = alternativa.AlternativaId,
                Correta = alternativa.Correta
            });
            await db.SaveChangesAsync();
            await transacao.CommitAsync();

            return new RegistrarRespostaResponse
            {
                Respondidas = await ConsultasDaSala.ContarRespostasAsync(db, salaPergunta.SalaPerguntaId, sala.RodadaAtual),
                TotalParticipantes = await ConsultasDaSala.ContarParticipantesAsync(db, sala.SalaId)
            };
        }
        catch (DbUpdateException ex) when (ErrosDoBanco.ViolouRestricaoUnica(ex))
        {
            return RespostaDuplicada();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao registrar resposta da sala. VisitanteId: {VisitanteId}, Codigo: {Codigo}, AlternativaId: {AlternativaId}",
                visitanteId, codigoNormalizado, alternativaId);
            return RespostaBase.ComErro<RegistrarRespostaResponse>("Erro ao registrar a resposta.");
        }
    }

    private static RegistrarRespostaResponse RespostaDuplicada()
    {
        return RespostaBase.ComErro<RegistrarRespostaResponse>("Esta pergunta já foi respondida.", TipoDeErro.Conflito, "RespostaDuplicada");
    }

    private static T? ValidarDono<T>(Sala? sala, int moderadorId) where T : RespostaBase, new()
    {
        if (sala == null)
            return RespostaBase.ComErro<T>("Código de sala não encontrado.", TipoDeErro.NaoEncontrado);

        if (sala.ModeradorId != moderadorId)
            return RespostaBase.ComErro<T>("Só o moderador dono da sala pode fazer isso.", TipoDeErro.AcessoNegado);

        return null;
    }
}
