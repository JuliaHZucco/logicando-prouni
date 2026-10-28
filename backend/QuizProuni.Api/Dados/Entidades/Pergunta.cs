namespace QuizProuni.Api.Dados.Entidades;

public class Pergunta
{
    public string PerguntaId { get; set; } = string.Empty;
    public string CategoriaId { get; set; } = string.Empty;
    public string? PerguntaBaseId { get; set; }
    public string Enunciado { get; set; } = string.Empty;
    public string? Resposta { get; set; }
    public short Ordem { get; set; }
    public bool Ativa { get; set; } = true;
}
