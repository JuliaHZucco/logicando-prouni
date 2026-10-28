namespace QuizProuni.Api.Dados.Entidades;

public class PartidaPergunta
{
    public int PartidaIndividualId { get; set; }
    public string PerguntaId { get; set; } = string.Empty;
    public short Ordem { get; set; }
}
