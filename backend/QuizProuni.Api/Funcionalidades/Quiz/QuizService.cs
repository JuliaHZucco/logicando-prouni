using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Quiz;

public class QuizService
{
    private readonly QuizProuniContext db;
    private readonly ILogger<QuizService> logger;

    public QuizService(QuizProuniContext db, ILogger<QuizService> logger)
    {
        this.db = db;
        this.logger = logger;
    }

    public Task<CriarPartidaResponse> CriarPartidaAsync(int visitanteId, CriarPartidaRequest request)
    {
        return QuizRegras.CriarPartidaAsync(db, visitanteId, request, logger);
    }

    public Task<ResultadoPartidaResponse> ObterResultadoAsync(int? visitanteId, int partidaId)
    {
        return QuizRegras.ObterResultadoAsync(db, visitanteId, partidaId, logger);
    }

    public Task<ResponderPerguntaResponse> ResponderAsync(int visitanteId, int partidaId, ResponderPerguntaRequest request)
    {
        return QuizRegras.ResponderAsync(db, visitanteId, partidaId, request, logger);
    }
}
