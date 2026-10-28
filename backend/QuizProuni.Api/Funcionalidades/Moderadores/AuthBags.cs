using QuizProuni.Api.Compartilhado;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}

public class LoginResponse : RespostaBase
{
    public int ModeradorId { get; set; }
    public string Email { get; set; } = string.Empty;
}
