using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Conteudo;

public class ConteudoService
{
    private readonly QuizProuniContext db;
    private readonly ILogger<ConteudoService> logger;

    public ConteudoService(QuizProuniContext db, ILogger<ConteudoService> logger)
    {
        this.db = db;
        this.logger = logger;
    }

    public Task<ConteudoResponse> ObterConteudoAsync()
    {
        return ConteudoRegras.ObterConteudoAsync(db, logger);
    }
}
