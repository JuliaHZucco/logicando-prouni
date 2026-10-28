namespace QuizProuni.Api.Dados.Entidades;

public class Alternativa
{
    public int AlternativaId { get; set; }
    public string PerguntaId { get; set; } = string.Empty;
    public string Letra { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public bool Correta { get; set; }
}
