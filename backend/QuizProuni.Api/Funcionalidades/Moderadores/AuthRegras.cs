using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

public static class AuthRegras
{
    public static async Task<LoginResponse> LoginAsync(QuizProuniContext db, LoginRequest request, ILogger logger)
    {
        if (request == null)
            return RespostaBase.ComErro<LoginResponse>("Informe e-mail e senha.");

        try
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var moderador = await db.Moderadores.FirstOrDefaultAsync(x => x.Email == email);

            if (moderador == null || !BCrypt.Net.BCrypt.Verify(request.Senha, moderador.SenhaHash))
                return RespostaBase.ComErro<LoginResponse>("E-mail ou senha incorretos.", TipoDeErro.NaoAutorizado);

            return new LoginResponse { ModeradorId = moderador.ModeradorId, Email = moderador.Email };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao autenticar moderador.");
            return RespostaBase.ComErro<LoginResponse>("Erro ao entrar. Tente novamente.");
        }
    }

    public static async Task<LoginResponse> ObterModeradorAsync(QuizProuniContext db, int moderadorId, ILogger logger)
    {
        try
        {
            var moderador = await db.Moderadores.FirstOrDefaultAsync(x => x.ModeradorId == moderadorId);
            if (moderador == null)
                return RespostaBase.ComErro<LoginResponse>("Entre como moderador para continuar.", TipoDeErro.NaoAutorizado);

            return new LoginResponse { ModeradorId = moderador.ModeradorId, Email = moderador.Email };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter moderador. ModeradorId: {ModeradorId}", moderadorId);
            return RespostaBase.ComErro<LoginResponse>("Erro ao carregar o moderador.");
        }
    }
}
