using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;
using QuizProuni.Api.Funcionalidades.Quiz;

namespace QuizProuni.Api.Funcionalidades.Salas;

public static class SalaRegras
{
    public const int TamanhoMaximoDoNome = 60;
    public const int TamanhoMaximoDoApelido = 20;
    public const int SegundosMinimos = 10;
    public const int SegundosMaximos = 60;
    public const string EstadoAguardando = "aguardando";
    public const string EstadoEmAndamento = "em_andamento";
    public const string EstadoEncerrada = "encerrada";

    public static async Task<CriarSalaResponse> CriarAsync(QuizProuniContext db, int moderadorId, CriarSalaRequest request, ILogger logger)
    {
        if (request == null)
            return RespostaBase.ComErro<CriarSalaResponse>("Dados da sala não informados.");

        try
        {
            var nome = (request.Nome ?? string.Empty).Trim();
            if (nome.Length < 1 || nome.Length > TamanhoMaximoDoNome)
                return RespostaBase.ComErro<CriarSalaResponse>("Dê um nome para a sala, de 1 a 60 caracteres.");

            var erroDeConfiguracao = ConfiguracaoQuizRegras.Validar(request);
            if (erroDeConfiguracao != null)
                return RespostaBase.ComErro<CriarSalaResponse>(erroDeConfiguracao);

            if (request.SegundosPorPergunta != null && (request.SegundosPorPergunta < SegundosMinimos || request.SegundosPorPergunta > SegundosMaximos))
                return RespostaBase.ComErro<CriarSalaResponse>("O cronômetro deve ter de 10 a 60 segundos.");

            var (perguntasIds, erroDoSorteio) = await ConfiguracaoQuizRegras.SortearPerguntasAsync(db, request);
            if (erroDoSorteio != null)
                return RespostaBase.ComErro<CriarSalaResponse>(erroDoSorteio);

            await using var transacao = await db.Database.BeginTransactionAsync();

            var sala = new Sala
            {
                Codigo = await CodigoDaSala.GerarLivreAsync(db),
                Nome = nome,
                ModeradorId = moderadorId,
                Modo = request.Modo,
                QuantidadePerguntas = (short)request.Quantidade,
                UsaCronometro = request.SegundosPorPergunta != null,
                SegundosPorPergunta = request.SegundosPorPergunta
            };
            db.Salas.Add(sala);
            await db.SaveChangesAsync();

            foreach (var categoriaId in request.Categorias.Distinct())
                db.SalaCategorias.Add(new SalaCategoria { SalaId = sala.SalaId, CategoriaId = categoriaId });

            var salaPerguntas = new List<SalaPergunta>();
            for (var posicao = 0; posicao < perguntasIds.Count; posicao++)
            {
                var salaPergunta = new SalaPergunta { SalaId = sala.SalaId, PerguntaId = perguntasIds[posicao], Ordem = (short)(posicao + 1) };
                salaPerguntas.Add(salaPergunta);
                db.SalaPerguntas.Add(salaPergunta);
            }
            await db.SaveChangesAsync();

            foreach (var salaPergunta in salaPerguntas)
            {
                var alternativasIds = await db.Alternativas
                    .Where(x => x.PerguntaId == salaPergunta.PerguntaId)
                    .Select(x => x.AlternativaId)
                    .ToArrayAsync();
                Random.Shared.Shuffle(alternativasIds);

                for (var posicao = 0; posicao < alternativasIds.Length; posicao++)
                {
                    db.SalaPerguntaAlternativas.Add(new SalaPerguntaAlternativa
                    {
                        SalaPerguntaId = salaPergunta.SalaPerguntaId,
                        AlternativaId = alternativasIds[posicao],
                        Posicao = (short)(posicao + 1)
                    });
                }
            }
            await db.SaveChangesAsync();

            await transacao.CommitAsync();
            return new CriarSalaResponse { Codigo = sala.Codigo };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao criar sala. ModeradorId: {ModeradorId}, Modo: {Modo}, Quantidade: {Quantidade}", moderadorId, request.Modo, request.Quantidade);
            return RespostaBase.ComErro<CriarSalaResponse>("Erro ao criar a sala.");
        }
    }

    public static async Task<ListarMinhasSalasResponse> ListarMinhasAsync(QuizProuniContext db, int moderadorId, string? busca, string? estado, DateOnly? de, DateOnly? ate, ILogger logger)
    {
        try
        {
            var consulta = db.Salas.Where(x => x.ModeradorId == moderadorId);

            if (!string.IsNullOrWhiteSpace(estado))
            {
                var consultaDoEstado = FiltrarPorEstado(consulta, estado);
                if (consultaDoEstado == null)
                    return RespostaBase.ComErro<ListarMinhasSalasResponse>("Estado inválido. Use aguardando, em_andamento ou encerrada.");

                consulta = consultaDoEstado;
            }

            var texto = (busca ?? string.Empty).Trim();
            if (texto.Length > 0)
            {
                var padraoDoNome = $"%{EscaparCuringas(texto)}%";
                var padraoDoCodigo = $"{EscaparCuringas(texto)}%";
                consulta = consulta.Where(x => EF.Functions.ILike(x.Nome, padraoDoNome) || EF.Functions.ILike(x.Codigo, padraoDoCodigo));
            }

            if (de != null)
            {
                var inicio = new DateTimeOffset(de.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
                consulta = consulta.Where(x => x.DataCriacao >= inicio);
            }

            if (ate != null)
            {
                var limite = new DateTimeOffset(ate.Value.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
                consulta = consulta.Where(x => x.DataCriacao < limite);
            }

            var salas = await consulta.OrderByDescending(x => x.DataCriacao).ToListAsync();
            var salasIds = salas.Select(x => x.SalaId).ToList();

            var participantesPorSala = await db.Participantes
                .Where(x => salasIds.Contains(x.SalaId))
                .GroupBy(x => x.SalaId)
                .Select(grupo => new { SalaId = grupo.Key, Total = grupo.Count() })
                .ToDictionaryAsync(x => x.SalaId, x => x.Total);

            var categoriasPorSala = await (
                from salaCategoria in db.SalaCategorias
                join categoria in db.Categorias on salaCategoria.CategoriaId equals categoria.CategoriaId
                where salasIds.Contains(salaCategoria.SalaId)
                orderby categoria.Ordem
                select new { salaCategoria.SalaId, categoria.Nome }
            ).ToListAsync();

            return new ListarMinhasSalasResponse
            {
                Salas = salas.Select(sala => new SalaResumoBag
                {
                    Codigo = sala.Codigo,
                    Nome = sala.Nome,
                    Status = sala.Status,
                    Modo = sala.Modo,
                    Quantidade = sala.QuantidadePerguntas,
                    Categorias = categoriasPorSala.Where(x => x.SalaId == sala.SalaId).Select(x => x.Nome).ToList(),
                    CriadaEm = sala.DataCriacao,
                    Participantes = participantesPorSala.GetValueOrDefault(sala.SalaId)
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao listar salas do moderador. ModeradorId: {ModeradorId}", moderadorId);
            return RespostaBase.ComErro<ListarMinhasSalasResponse>("Erro ao carregar as salas.");
        }
    }

    public static async Task<RankingResponse> ObterRankingGeralAsync(QuizProuniContext db, int moderadorId, string codigo, ILogger logger)
    {
        try
        {
            var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);
            var sala = await db.Salas.FirstOrDefaultAsync(x => x.Codigo == codigoNormalizado);

            if (sala == null)
                return RespostaBase.ComErro<RankingResponse>("Código de sala não encontrado.", TipoDeErro.NaoEncontrado);

            if (sala.ModeradorId != moderadorId)
                return RespostaBase.ComErro<RankingResponse>("Só o moderador dono da sala vê o ranking geral.", TipoDeErro.AcessoNegado);

            return new RankingResponse { Ranking = await ConsultasDaSala.MontarRankingAsync(db, sala) };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter ranking geral. ModeradorId: {ModeradorId}, Codigo: {Codigo}", moderadorId, codigo);
            return RespostaBase.ComErro<RankingResponse>("Erro ao carregar o ranking.");
        }
    }

    public static async Task<EntrarNaSalaResponse> EntrarAsync(QuizProuniContext db, int visitanteId, string codigo, EntrarNaSalaRequest request, ILogger logger)
    {
        var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);
        var apelido = (request?.Apelido ?? string.Empty).Trim();

        try
        {
            await using var transacao = await db.Database.BeginTransactionAsync();

            var sala = await ConsultasDaSala.BuscarTravandoParaAlterarAsync(db, codigoNormalizado);
            if (sala == null)
                return RespostaBase.ComErro<EntrarNaSalaResponse>("Código de sala não encontrado.", TipoDeErro.NaoEncontrado);

            var existente = await db.Participantes.FirstOrDefaultAsync(x => x.SalaId == sala.SalaId && x.VisitanteId == visitanteId);
            if (existente != null)
            {
                existente.DataUltimoAcesso = DateTimeOffset.UtcNow;
                await db.SaveChangesAsync();
                await transacao.CommitAsync();

                return new EntrarNaSalaResponse
                {
                    Participante = new ParticipanteBag { Id = existente.ParticipanteId, Apelido = existente.Apelido },
                    Reconectado = true,
                    Participantes = await ConsultasDaSala.ListarParticipantesAsync(db, sala.SalaId)
                };
            }

            if (sala.Status == ConsultasDaSala.StatusRanking || sala.Status == ConsultasDaSala.StatusEncerrada)
                return RespostaBase.ComErro<EntrarNaSalaResponse>("Esta sala já terminou e não aceita novas entradas.", TipoDeErro.Conflito, "SalaEncerrada");

            if (apelido.Length < 1 || apelido.Length > TamanhoMaximoDoApelido)
                return RespostaBase.ComErro<EntrarNaSalaResponse>("Escolha um apelido de 1 a 20 caracteres.", TipoDeErro.Negocio, "PrecisaApelido");

            var novo = new Participante { SalaId = sala.SalaId, VisitanteId = visitanteId, Apelido = apelido };
            db.Participantes.Add(novo);
            await db.SaveChangesAsync();
            await transacao.CommitAsync();

            return new EntrarNaSalaResponse
            {
                Participante = new ParticipanteBag { Id = novo.ParticipanteId, Apelido = novo.Apelido },
                Reconectado = false,
                Participantes = await ConsultasDaSala.ListarParticipantesAsync(db, sala.SalaId)
            };
        }
        catch (DbUpdateException ex) when (ErrosDoBanco.ViolouRestricaoUnica(ex, "uq_participantes_apelido"))
        {
            return RespostaBase.ComErro<EntrarNaSalaResponse>(
                $"Já existe alguém com o apelido “{apelido}” nesta sala. Escolha outro (maiúsculas e minúsculas contam como iguais).",
                TipoDeErro.Conflito,
                "ApelidoEmUso");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao entrar na sala. VisitanteId: {VisitanteId}, Codigo: {Codigo}", visitanteId, codigoNormalizado);
            return RespostaBase.ComErro<EntrarNaSalaResponse>("Erro ao entrar na sala.");
        }
    }

    public static async Task<EstadoDaSalaResponse> ObterEstadoAsync(QuizProuniContext db, int? moderadorId, int? visitanteId, string codigo, ILogger logger)
    {
        try
        {
            var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);
            var sala = await db.Salas.FirstOrDefaultAsync(x => x.Codigo == codigoNormalizado);
            if (sala == null)
                return RespostaBase.ComErro<EstadoDaSalaResponse>("Código de sala não encontrado.", TipoDeErro.NaoEncontrado);

            var souModerador = moderadorId != null && sala.ModeradorId == moderadorId;
            var participante = visitanteId == null
                ? null
                : await db.Participantes.FirstOrDefaultAsync(x => x.SalaId == sala.SalaId && x.VisitanteId == visitanteId);

            if (!souModerador && participante == null)
                return RespostaBase.ComErro<EstadoDaSalaResponse>("Entre na sala pelo código primeiro.", TipoDeErro.AcessoNegado);

            var participantes = await ConsultasDaSala.ListarParticipantesAsync(db, sala.SalaId);

            var estado = new EstadoDaSalaBag
            {
                Codigo = sala.Codigo,
                Nome = sala.Nome,
                Status = sala.Status,
                Modo = sala.Modo,
                Categorias = await (
                    from salaCategoria in db.SalaCategorias
                    join categoria in db.Categorias on salaCategoria.CategoriaId equals categoria.CategoriaId
                    where salaCategoria.SalaId == sala.SalaId
                    orderby categoria.Ordem
                    select categoria.Nome
                ).ToListAsync(),
                QuantidadePerguntas = sala.QuantidadePerguntas,
                SegundosPorPergunta = sala.SegundosPorPergunta,
                PerguntaAtual = sala.PerguntaAtual,
                Rodada = sala.RodadaAtual,
                TotalParticipantes = participantes.Count,
                Participantes = participantes,
                SouModerador = souModerador,
                Participante = participante == null ? null : new ParticipanteBag { Id = participante.ParticipanteId, Apelido = participante.Apelido }
            };

            if (sala.Status == ConsultasDaSala.StatusPerguntaAberta || sala.Status == ConsultasDaSala.StatusResultadoPergunta)
            {
                var (salaPergunta, pergunta) = await ConsultasDaSala.BuscarPerguntaAtualAsync(db, sala);
                estado.Pergunta = pergunta;

                if (participante != null)
                {
                    estado.MinhaAlternativaId = await db.Respostas
                        .Where(x => x.SalaPerguntaId == salaPergunta.SalaPerguntaId && x.Rodada == sala.RodadaAtual && x.ParticipanteId == participante.ParticipanteId)
                        .Select(x => (int?)x.AlternativaId)
                        .FirstOrDefaultAsync();
                }

                if (sala.Status == ConsultasDaSala.StatusResultadoPergunta)
                    estado.Resultado = await ConsultasDaSala.MontarResultadoAsync(db, sala, salaPergunta);
            }

            if (sala.Status == ConsultasDaSala.StatusRanking || sala.Status == ConsultasDaSala.StatusEncerrada)
            {
                var ranking = await ConsultasDaSala.MontarRankingAsync(db, sala);
                estado.Ranking = ConsultasDaSala.MontarPodio(ranking);
                estado.MinhaPosicao = participante == null ? null : ranking.FirstOrDefault(x => x.ParticipanteId == participante.ParticipanteId);
            }

            return new EstadoDaSalaResponse { Estado = estado };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter estado da sala. Codigo: {Codigo}", codigo);
            return RespostaBase.ComErro<EstadoDaSalaResponse>("Erro ao carregar a sala.");
        }
    }

    public static async Task<(bool Dono, bool Participante)> VerificarAcessoAsync(QuizProuniContext db, string codigo, int? moderadorId, int? visitanteId)
    {
        var codigoNormalizado = ConsultasDaSala.NormalizarCodigo(codigo);
        var sala = await db.Salas.FirstOrDefaultAsync(x => x.Codigo == codigoNormalizado);
        if (sala == null)
            return (false, false);

        var dono = moderadorId != null && sala.ModeradorId == moderadorId;
        var participante = visitanteId != null
            && await db.Participantes.AnyAsync(x => x.SalaId == sala.SalaId && x.VisitanteId == visitanteId);

        return (dono, participante);
    }

    private static IQueryable<Sala>? FiltrarPorEstado(IQueryable<Sala> consulta, string estado)
    {
        return estado switch
        {
            EstadoAguardando => consulta.Where(x => x.Status == ConsultasDaSala.StatusAguardando),
            EstadoEmAndamento => consulta.Where(x =>
                x.Status == ConsultasDaSala.StatusPerguntaAberta
                || x.Status == ConsultasDaSala.StatusResultadoPergunta
                || x.Status == ConsultasDaSala.StatusRanking),
            EstadoEncerrada => consulta.Where(x => x.Status == ConsultasDaSala.StatusEncerrada),
            _ => null
        };
    }

    private static string EscaparCuringas(string texto)
    {
        return texto.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}
