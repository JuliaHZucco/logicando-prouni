using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Funcionalidades.Quiz;

public static class QuizRegras
{
    public static async Task<CriarPartidaResponse> CriarPartidaAsync(QuizProuniContext db, int visitanteId, CriarPartidaRequest request, ILogger logger)
    {
        if (request == null)
            return new CriarPartidaResponse { Erro = "Dados da partida não informados." };

        try
        {
            if (request.RepetirPartidaId != null)
                return await RepetirPartidaAsync(db, visitanteId, request.RepetirPartidaId.Value);

            return await IniciarNovaPartidaAsync(db, visitanteId, request);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao criar partida. VisitanteId: {VisitanteId}, Modo: {Modo}, Quantidade: {Quantidade}, RepetirPartidaId: {RepetirPartidaId}",
                visitanteId, request.Modo, request.Quantidade, request.RepetirPartidaId);
            return new CriarPartidaResponse { Erro = "Erro ao iniciar o quiz." };
        }
    }

    public static async Task<ResponderPerguntaResponse> ResponderAsync(QuizProuniContext db, int visitanteId, int partidaId, ResponderPerguntaRequest request, ILogger logger)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.PerguntaId))
            return new ResponderPerguntaResponse { Erro = "Dados da resposta não informados." };

        try
        {
            var partida = await db.PartidasIndividuais
                .FirstOrDefaultAsync(x => x.PartidaIndividualId == partidaId && x.VisitanteId == visitanteId);

            if (partida == null)
                return new ResponderPerguntaResponse { Erro = "Partida não encontrada.", TipoErro = TipoDeErro.NaoEncontrado };

            if (partida.DataFim != null)
                return new ResponderPerguntaResponse { Erro = "Esta partida já terminou.", TipoErro = TipoDeErro.Conflito, CodigoErro = "PartidaEncerrada" };

            var perguntaNaPartida = await db.PartidaPerguntas
                .AnyAsync(x => x.PartidaIndividualId == partidaId && x.PerguntaId == request.PerguntaId);

            if (!perguntaNaPartida)
                return new ResponderPerguntaResponse { Erro = "Esta pergunta não faz parte da partida." };

            var alternativas = await db.Alternativas.Where(x => x.PerguntaId == request.PerguntaId).ToListAsync();
            var escolhida = alternativas.FirstOrDefault(x => x.AlternativaId == request.AlternativaId);

            if (escolhida == null)
                return new ResponderPerguntaResponse { Erro = "Alternativa inválida para esta pergunta." };

            var jaRespondida = await db.RespostasIndividuais
                .AnyAsync(x => x.PartidaIndividualId == partidaId && x.PerguntaId == request.PerguntaId);

            if (jaRespondida)
                return RespostaDuplicada();

            await using var transacao = await db.Database.BeginTransactionAsync();

            db.RespostasIndividuais.Add(new RespostaIndividual
            {
                PartidaIndividualId = partidaId,
                PerguntaId = request.PerguntaId,
                AlternativaId = escolhida.AlternativaId,
                Correta = escolhida.Correta
            });
            await db.SaveChangesAsync();

            var totalDePerguntas = await db.PartidaPerguntas.CountAsync(x => x.PartidaIndividualId == partidaId);
            var totalDeRespostas = await db.RespostasIndividuais.CountAsync(x => x.PartidaIndividualId == partidaId);
            if (totalDeRespostas == totalDePerguntas)
            {
                partida.DataFim = DateTimeOffset.UtcNow;
                await db.SaveChangesAsync();
            }

            await transacao.CommitAsync();

            var pergunta = await db.Perguntas.FirstAsync(x => x.PerguntaId == request.PerguntaId);
            var baseDuvidaId = pergunta.PerguntaBaseId ?? pergunta.PerguntaId;
            var explicacao = pergunta.Resposta
                ?? await db.Perguntas.Where(x => x.PerguntaId == baseDuvidaId).Select(x => x.Resposta).FirstAsync();

            return new ResponderPerguntaResponse
            {
                Correta = escolhida.Correta,
                AlternativaCorretaId = alternativas.First(x => x.Correta).AlternativaId,
                Explicacao = explicacao ?? string.Empty,
                BaseDuvidaId = baseDuvidaId
            };
        }
        catch (DbUpdateException ex) when (ErrosDoBanco.ViolouRestricaoUnica(ex))
        {
            return RespostaDuplicada();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao registrar resposta. VisitanteId: {VisitanteId}, PartidaId: {PartidaId}, PerguntaId: {PerguntaId}",
                visitanteId, partidaId, request.PerguntaId);
            return new ResponderPerguntaResponse { Erro = "Erro ao registrar a resposta." };
        }
    }

    public static async Task<ResultadoPartidaResponse> ObterResultadoAsync(QuizProuniContext db, int? visitanteId, int partidaId, ILogger logger)
    {
        try
        {
            var partida = visitanteId == null
                ? null
                : await db.PartidasIndividuais.FirstOrDefaultAsync(x => x.PartidaIndividualId == partidaId && x.VisitanteId == visitanteId);

            if (partida == null)
                return RespostaBase.ComErro<ResultadoPartidaResponse>("Partida não encontrada.", TipoDeErro.NaoEncontrado);

            var itens = await (
                from partidaPergunta in db.PartidaPerguntas
                join pergunta in db.Perguntas on partidaPergunta.PerguntaId equals pergunta.PerguntaId
                join resposta in db.RespostasIndividuais
                    on new { partidaPergunta.PartidaIndividualId, partidaPergunta.PerguntaId }
                    equals new { resposta.PartidaIndividualId, resposta.PerguntaId } into respostas
                from resposta in respostas.DefaultIfEmpty()
                where partidaPergunta.PartidaIndividualId == partidaId
                orderby partidaPergunta.Ordem
                select new ItemDoResultadoBag
                {
                    Ordem = partidaPergunta.Ordem,
                    DuvidaId = pergunta.PerguntaId,
                    DuvidaPergunta = pergunta.Enunciado,
                    CategoriaId = pergunta.CategoriaId,
                    BaseDuvidaId = pergunta.PerguntaBaseId ?? pergunta.PerguntaId,
                    Correta = resposta == null ? (bool?)null : resposta.Correta
                }
            ).ToListAsync();

            var acertos = itens.Count(x => x.Correta == true);
            var percentual = itens.Count == 0 ? 0 : (int)Math.Round(100.0 * acertos / itens.Count, MidpointRounding.AwayFromZero);

            return new ResultadoPartidaResponse
            {
                PartidaId = partidaId,
                Finalizada = partida.DataFim != null,
                TotalPerguntas = itens.Count,
                Acertos = acertos,
                PercentualAcerto = percentual,
                AproveitamentoPositivo = itens.Count > 0 && acertos * 2 > itens.Count,
                Itens = itens
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter o resultado da partida. VisitanteId: {VisitanteId}, PartidaId: {PartidaId}", visitanteId, partidaId);
            return RespostaBase.ComErro<ResultadoPartidaResponse>("Erro ao carregar o resultado.");
        }
    }

    private static ResponderPerguntaResponse RespostaDuplicada()
    {
        return new ResponderPerguntaResponse
        {
            Erro = "Esta pergunta já foi respondida.",
            TipoErro = TipoDeErro.Conflito,
            CodigoErro = "RespostaDuplicada"
        };
    }

    private static async Task<CriarPartidaResponse> IniciarNovaPartidaAsync(QuizProuniContext db, int visitanteId, CriarPartidaRequest request)
    {
        var erroDeConfiguracao = ConfiguracaoQuizRegras.Validar(request);
        if (erroDeConfiguracao != null)
            return new CriarPartidaResponse { Erro = erroDeConfiguracao };

        var (perguntasIds, erroDoSorteio) = await ConfiguracaoQuizRegras.SortearPerguntasAsync(db, request);
        if (erroDoSorteio != null)
            return new CriarPartidaResponse { Erro = erroDoSorteio };

        await using var transacao = await db.Database.BeginTransactionAsync();

        var partida = new PartidaIndividual { VisitanteId = visitanteId, Modo = request.Modo };
        db.PartidasIndividuais.Add(partida);
        await db.SaveChangesAsync();

        for (var posicao = 0; posicao < perguntasIds.Count; posicao++)
        {
            db.PartidaPerguntas.Add(new PartidaPergunta
            {
                PartidaIndividualId = partida.PartidaIndividualId,
                PerguntaId = perguntasIds[posicao],
                Ordem = (short)(posicao + 1)
            });
        }
        await db.SaveChangesAsync();

        await transacao.CommitAsync();

        return await MontarPartidaAsync(db, partida.PartidaIndividualId);
    }

    private static async Task<CriarPartidaResponse> RepetirPartidaAsync(QuizProuniContext db, int visitanteId, int partidaOriginalId)
    {
        var original = await db.PartidasIndividuais
            .FirstOrDefaultAsync(x => x.PartidaIndividualId == partidaOriginalId && x.VisitanteId == visitanteId);

        if (original == null)
            return new CriarPartidaResponse { Erro = "Partida não encontrada.", TipoErro = TipoDeErro.NaoEncontrado };

        await using var transacao = await db.Database.BeginTransactionAsync();

        var novaPartida = new PartidaIndividual { VisitanteId = visitanteId, Modo = original.Modo };
        db.PartidasIndividuais.Add(novaPartida);
        await db.SaveChangesAsync();

        var perguntasDaOriginal = await db.PartidaPerguntas
            .Where(x => x.PartidaIndividualId == partidaOriginalId)
            .ToListAsync();

        foreach (var pergunta in perguntasDaOriginal)
        {
            db.PartidaPerguntas.Add(new PartidaPergunta
            {
                PartidaIndividualId = novaPartida.PartidaIndividualId,
                PerguntaId = pergunta.PerguntaId,
                Ordem = pergunta.Ordem
            });
        }
        await db.SaveChangesAsync();

        await transacao.CommitAsync();

        return await MontarPartidaAsync(db, novaPartida.PartidaIndividualId);
    }

    private static async Task<CriarPartidaResponse> MontarPartidaAsync(QuizProuniContext db, int partidaId)
    {
        var perguntasDaPartida = await (
            from partidaPergunta in db.PartidaPerguntas
            join pergunta in db.Perguntas on partidaPergunta.PerguntaId equals pergunta.PerguntaId
            join categoria in db.Categorias on pergunta.CategoriaId equals categoria.CategoriaId
            where partidaPergunta.PartidaIndividualId == partidaId
            orderby partidaPergunta.Ordem
            select new { pergunta.PerguntaId, pergunta.Enunciado, categoria.CategoriaId, CategoriaNome = categoria.Nome }
        ).ToListAsync();

        var perguntasIds = perguntasDaPartida.Select(x => x.PerguntaId).ToList();
        var alternativas = await db.Alternativas.Where(x => perguntasIds.Contains(x.PerguntaId)).ToListAsync();

        return new CriarPartidaResponse
        {
            PartidaId = partidaId,
            Perguntas = perguntasDaPartida.Select(pergunta =>
            {
                var opcoes = alternativas
                    .Where(x => x.PerguntaId == pergunta.PerguntaId)
                    .Select(x => new OpcaoRespostaBag { AlternativaId = x.AlternativaId, Texto = x.Texto })
                    .ToArray();
                Random.Shared.Shuffle(opcoes);

                return new PerguntaQuizBag
                {
                    DuvidaId = pergunta.PerguntaId,
                    DuvidaPergunta = pergunta.Enunciado,
                    CategoriaId = pergunta.CategoriaId,
                    CategoriaNome = pergunta.CategoriaNome,
                    OpcoesResposta = opcoes.ToList()
                };
            }).ToList()
        };
    }
}
