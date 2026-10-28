namespace QuizProuni.Api.Dados.Entidades;

public class Moderador
{
    public int ModeradorId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
}
