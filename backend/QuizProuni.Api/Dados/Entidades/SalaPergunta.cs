namespace QuizProuni.Api.Dados.Entidades;

public class SalaPergunta
{
    public int SalaPerguntaId { get; set; }
    public int SalaId { get; set; }
    public string PerguntaId { get; set; } = string.Empty;
    public short Ordem { get; set; }
}
