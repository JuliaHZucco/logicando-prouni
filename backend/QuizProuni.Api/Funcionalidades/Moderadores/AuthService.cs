using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

public class AuthService
{
    private readonly QuizProuniContext db;
    private readonly ILogger<AuthService> logger;

    public AuthService(QuizProuniContext db, ILogger<AuthService> logger)
    {
        this.db = db;
        this.logger = logger;
    }

    public Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        return AuthRegras.LoginAsync(db, request, logger);
    }

    public Task<LoginResponse> ObterModeradorAsync(int moderadorId)
    {
        return AuthRegras.ObterModeradorAsync(db, moderadorId, logger);
    }
}
