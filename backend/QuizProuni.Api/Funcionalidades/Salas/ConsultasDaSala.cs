using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Funcionalidades.Salas;

public static class ConsultasDaSala
{
    public const int QuantidadeNoPodio = 3;

    public const string StatusAguardando = "aguardando";
    public const string StatusPerguntaAberta = "pergunta_aberta";
    public const string StatusResultadoPergunta = "resultado_pergunta";
    public const string StatusRanking = "ranking";
    public const string StatusEncerrada = "encerrada";

    public static string NormalizarCodigo(string? codigo)
    {
        return (codigo ?? string.Empty).Trim().ToUpperInvariant();
    }

    public static async Task<Sala?> BuscarTravandoParaAlterarAsync(QuizProuniContext db, string codigo)
    {
        var salas = await db.Salas
            .FromSqlInterpolated($"SELECT * FROM salas WHERE codigo = {codigo} FOR UPDATE")
            .ToListAsync();
        return salas.FirstOrDefault();
    }

    public static async Task<Sala?> BuscarTravandoParaLerAsync(QuizProuniContext db, string codigo)
    {
        var salas = await db.Salas
            .FromSqlInterpolated($"SELECT * FROM salas WHERE codigo = {codigo} FOR SHARE")
            .ToListAsync();
        return salas.FirstOrDefault();
    }

    public static Task<int> ContarParticipantesAsync(QuizProuniContext db, int salaId)
    {
        return db.Participantes.CountAsync(x => x.SalaId == salaId);
    }

    public static Task<int> ContarRespostasAsync(QuizProuniContext db, int salaPerguntaId, int rodada)
    {
        return db.Respostas.CountAsync(x => x.SalaPerguntaId == salaPerguntaId && x.Rodada == rodada);
    }

    public static Task<List<ParticipanteBag>> ListarParticipantesAsync(QuizProuniContext db, int salaId)
    {
        return db.Participantes
            .Where(x => x.SalaId == salaId)
            .OrderBy(x => x.DataEntrada)
            .Select(x => new ParticipanteBag { Id = x.ParticipanteId, Apelido = x.Apelido })
            .ToListAsync();
    }

    public static async Task<(SalaPergunta SalaPergunta, PerguntaDaSalaBag Pergunta)> BuscarPerguntaAtualAsync(QuizProuniContext db, Sala sala)
    {
        var salaPergunta = await db.SalaPerguntas
            .FirstAsync(x => x.SalaId == sala.SalaId && x.Ordem == sala.PerguntaAtual);

        var exibicao = await db.Exibicoes
            .FirstAsync(x => x.SalaPerguntaId == salaPergunta.SalaPerguntaId && x.Rodada == sala.RodadaAtual);

        var enunciado = await db.Perguntas
            .Where(x => x.PerguntaId == salaPergunta.PerguntaId)
            .Select(x => x.Enunciado)
            .FirstAsync();

        var alternativas = await (
            from posicionada in db.SalaPerguntaAlternativas
            join alternativa in db.Alternativas on posicionada.AlternativaId equals alternativa.AlternativaId
            where posicionada.SalaPerguntaId == salaPergunta.SalaPerguntaId
            orderby posicionada.Posicao
            select new AlternativaDaSalaBag
            {
                AlternativaId = alternativa.AlternativaId,
                Texto = alternativa.Texto,
                Posicao = posicionada.Posicao
            }
        ).ToListAsync();

        var pergunta = new PerguntaDaSalaBag
        {
            Ordem = salaPergunta.Ordem,
            Total = sala.QuantidadePerguntas,
            Enunciado = enunciado,
            Alternativas = alternativas,
            SegundosRestantes = CalcularSegundosRestantes(sala, exibicao),
            Respondidas = await ContarRespostasAsync(db, salaPergunta.SalaPerguntaId, sala.RodadaAtual)
        };

        return (salaPergunta, pergunta);
    }

    public static async Task<ResultadoDaPerguntaBag> MontarResultadoAsync(QuizProuniContext db, Sala sala, SalaPergunta salaPergunta)
    {
        var alternativas = await (
            from posicionada in db.SalaPerguntaAlternativas
            join alternativa in db.Alternativas on posicionada.AlternativaId equals alternativa.AlternativaId
            where posicionada.SalaPerguntaId == salaPergunta.SalaPerguntaId
            orderby posicionada.Posicao
            select new { alternativa.AlternativaId, alternativa.Texto, alternativa.Correta, posicionada.Posicao }
        ).ToListAsync();

        var respostas = await db.Respostas
            .Where(x => x.SalaPerguntaId == salaPergunta.SalaPerguntaId && x.Rodada == sala.RodadaAtual)
            .Select(x => new { x.AlternativaId, x.Correta })
            .ToListAsync();

        var totalParticipantes = await ContarParticipantesAsync(db, sala.SalaId);
        var totalRespostas = respostas.Count;
        var acertos = respostas.Count(x => x.Correta);

        var pergunta = await db.Perguntas.FirstAsync(x => x.PerguntaId == salaPergunta.PerguntaId);
        var explicacao = pergunta.Resposta
            ?? await db.Perguntas.Where(x => x.PerguntaId == pergunta.PerguntaBaseId).Select(x => x.Resposta).FirstAsync();

        return new ResultadoDaPerguntaBag
        {
            TotalParticipantes = totalParticipantes,
            TotalRespostas = totalRespostas,
            NaoResponderam = Math.Max(0, totalParticipantes - totalRespostas),
            Acertos = acertos,
            Erros = totalRespostas - acertos,
            PercentualAcerto = totalRespostas == 0 ? 0 : (int)Math.Round(100.0 * acertos / totalRespostas, MidpointRounding.AwayFromZero),
            AlternativaCorretaId = alternativas.First(x => x.Correta).AlternativaId,
            Explicacao = explicacao ?? string.Empty,
            Grafico = alternativas.Select(alternativa =>
            {
                var quantidade = respostas.Count(x => x.AlternativaId == alternativa.AlternativaId);
                return new BarraDoGraficoBag
                {
                    AlternativaId = alternativa.AlternativaId,
                    Posicao = alternativa.Posicao,
                    Texto = alternativa.Texto,
                    Respostas = quantidade,
                    Percentual = totalRespostas == 0 ? 0 : Math.Round(1000.0 * quantidade / totalRespostas) / 10
                };
            }).ToList()
        };
    }

    public static async Task<List<LinhaDoRankingBag>> MontarRankingAsync(QuizProuniContext db, Sala sala)
    {
        var participantes = await db.Participantes.Where(x => x.SalaId == sala.SalaId).ToListAsync();

        var acertosPorParticipante = await (
            from resposta in db.Respostas
            join salaPergunta in db.SalaPerguntas on resposta.SalaPerguntaId equals salaPergunta.SalaPerguntaId
            where salaPergunta.SalaId == sala.SalaId && resposta.Rodada == sala.RodadaAtual && resposta.Correta
            group resposta by resposta.ParticipanteId into grupo
            select new { ParticipanteId = grupo.Key, Total = grupo.Count() }
        ).ToDictionaryAsync(x => x.ParticipanteId, x => x.Total);

        var encerramentos = await (
            from exibicao in db.Exibicoes
            join salaPergunta in db.SalaPerguntas on exibicao.SalaPerguntaId equals salaPergunta.SalaPerguntaId
            where salaPergunta.SalaId == sala.SalaId && exibicao.Rodada == sala.RodadaAtual && exibicao.DataEncerramento != null
            select exibicao.DataEncerramento!.Value
        ).ToListAsync();

        var acertosDeCada = participantes.ToDictionary(x => x.ParticipanteId, x => acertosPorParticipante.GetValueOrDefault(x.ParticipanteId));

        return participantes
            .Select(participante =>
            {
                var acertos = acertosDeCada[participante.ParticipanteId];
                var perguntasExibidas = encerramentos.Count(data => data > participante.DataEntrada);
                return new LinhaDoRankingBag
                {
                    ParticipanteId = participante.ParticipanteId,
                    Apelido = participante.Apelido,
                    Acertos = acertos,
                    Posicao = 1 + acertosDeCada.Values.Count(outros => outros > acertos),
                    PerguntasExibidas = perguntasExibidas,
                    Aproveitamento = perguntasExibidas == 0
                        ? null
                        : (int)Math.Round(100.0 * acertos / perguntasExibidas, MidpointRounding.AwayFromZero)
                };
            })
            .OrderBy(x => x.Posicao)
            .ThenBy(x => x.Apelido.ToLowerInvariant())
            .ToList();
    }

    public static List<LinhaDoRankingBag> MontarPodio(List<LinhaDoRankingBag> ranking)
    {
        return ranking.Where(x => x.Posicao <= QuantidadeNoPodio).ToList();
    }

    private static int? CalcularSegundosRestantes(Sala sala, Exibicao exibicao)
    {
        if (sala.SegundosPorPergunta == null || sala.Status != StatusPerguntaAberta)
            return null;

        var fim = exibicao.DataAbertura.AddSeconds(sala.SegundosPorPergunta.Value);
        var restante = (fim - DateTimeOffset.UtcNow).TotalSeconds;
        return Math.Max(0, (int)Math.Ceiling(restante));
    }
}
