namespace QuizProuni.Api.Dados.Entidades;

public class RespostaIndividual
{
    public int RespostaIndividualId { get; set; }
    public int PartidaIndividualId { get; set; }
    public string PerguntaId { get; set; } = string.Empty;
    public int AlternativaId { get; set; }
    public bool Correta { get; set; }
    public DateTimeOffset DataResposta { get; set; }
}
