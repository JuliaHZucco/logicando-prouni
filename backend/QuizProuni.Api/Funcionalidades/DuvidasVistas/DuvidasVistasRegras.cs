using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Funcionalidades.DuvidasVistas;

public static class DuvidasVistasRegras
{
    public static async Task<ListarDuvidasVistasResponse> ListarAsync(QuizProuniContext db, int? visitanteId, ILogger logger)
    {
        if (visitanteId == null)
            return new ListarDuvidasVistasResponse();

        try
        {
            var duvidasIds = await db.DuvidasVistas
                .Where(x => x.VisitanteId == visitanteId)
                .Select(x => x.PerguntaId)
                .ToListAsync();

            return new ListarDuvidasVistasResponse { DuvidasIds = duvidasIds };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao listar dúvidas vistas. VisitanteId: {VisitanteId}", visitanteId);
            return new ListarDuvidasVistasResponse { Erro = "Erro ao carregar as dúvidas vistas." };
        }
    }

    public static async Task<RespostaBase> RegistrarAsync(QuizProuniContext db, int visitanteId, RegistrarDuvidaVistaRequest request, ILogger logger)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.DuvidaId))
            return new RespostaBase { Erro = "Dúvida não informada." };

        try
        {
            var duvidaExiste = await db.Perguntas
                .AnyAsync(x => x.PerguntaId == request.DuvidaId && x.PerguntaBaseId == null && x.Ativa);

            if (!duvidaExiste)
                return new RespostaBase { Erro = "Dúvida não encontrada.", TipoErro = TipoDeErro.NaoEncontrado };

            var jaRegistrada = await db.DuvidasVistas
                .AnyAsync(x => x.VisitanteId == visitanteId && x.PerguntaId == request.DuvidaId);

            if (jaRegistrada)
                return new RespostaBase();

            db.DuvidasVistas.Add(new DuvidaVista { VisitanteId = visitanteId, PerguntaId = request.DuvidaId });
            await db.SaveChangesAsync();
            return new RespostaBase();
        }
        catch (DbUpdateException ex) when (ErrosDoBanco.ViolouRestricaoUnica(ex))
        {
            return new RespostaBase();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao registrar dúvida vista. VisitanteId: {VisitanteId}, DuvidaId: {DuvidaId}", visitanteId, request.DuvidaId);
            return new RespostaBase { Erro = "Erro ao registrar a dúvida vista." };
        }
    }
}
