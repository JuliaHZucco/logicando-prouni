using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Salas;

public class SalaService
{
    private readonly QuizProuniContext db;
    private readonly ILogger<SalaService> logger;

    public SalaService(QuizProuniContext db, ILogger<SalaService> logger)
    {
        this.db = db;
        this.logger = logger;
    }

    public Task<CriarSalaResponse> CriarAsync(int moderadorId, CriarSalaRequest request)
    {
        return SalaRegras.CriarAsync(db, moderadorId, request, logger);
    }

    public Task<ListarMinhasSalasResponse> ListarMinhasAsync(int moderadorId, string? busca, string? estado, DateOnly? de, DateOnly? ate)
    {
        return SalaRegras.ListarMinhasAsync(db, moderadorId, busca, estado, de, ate, logger);
    }

    public Task<RankingResponse> ObterRankingGeralAsync(int moderadorId, string codigo)
    {
        return SalaRegras.ObterRankingGeralAsync(db, moderadorId, codigo, logger);
    }

    public Task<EntrarNaSalaResponse> EntrarAsync(int visitanteId, string codigo, EntrarNaSalaRequest request)
    {
        return SalaRegras.EntrarAsync(db, visitanteId, codigo, request, logger);
    }

    public Task<EstadoDaSalaResponse> ObterEstadoAsync(int? moderadorId, int? visitanteId, string codigo)
    {
        return SalaRegras.ObterEstadoAsync(db, moderadorId, visitanteId, codigo, logger);
    }

    public Task<(bool Dono, bool Participante)> VerificarAcessoAsync(string codigo, int? moderadorId, int? visitanteId)
    {
        return SalaRegras.VerificarAcessoAsync(db, codigo, moderadorId, visitanteId);
    }
}
