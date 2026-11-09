using System.ComponentModel.DataAnnotations;
using QuizProuni.Api.Compartilhado;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

public class LoginRequest
{
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [StringLength(128)]
    public string Senha { get; set; } = string.Empty;
}

public class LoginResponse : RespostaBase
{
    public int ModeradorId { get; set; }
    public string Email { get; set; } = string.Empty;
}
