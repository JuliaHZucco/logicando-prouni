namespace QuizProuni.Api.Dados.Entidades;

public class PartidaIndividual
{
    public int PartidaIndividualId { get; set; }
    public int VisitanteId { get; set; }
    public string Modo { get; set; } = string.Empty;
    public DateTimeOffset DataInicio { get; set; }
    public DateTimeOffset? DataFim { get; set; }
}
