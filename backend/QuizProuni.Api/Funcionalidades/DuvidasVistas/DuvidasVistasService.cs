using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.DuvidasVistas;

public class DuvidasVistasService
{
    private readonly QuizProuniContext db;
    private readonly ILogger<DuvidasVistasService> logger;

    public DuvidasVistasService(QuizProuniContext db, ILogger<DuvidasVistasService> logger)
    {
        this.db = db;
        this.logger = logger;
    }

    public Task<ListarDuvidasVistasResponse> ListarAsync(int? visitanteId)
    {
        return DuvidasVistasRegras.ListarAsync(db, visitanteId, logger);
    }

    public Task<RespostaBase> RegistrarAsync(int visitanteId, RegistrarDuvidaVistaRequest request)
    {
        return DuvidasVistasRegras.RegistrarAsync(db, visitanteId, request, logger);
    }
}
