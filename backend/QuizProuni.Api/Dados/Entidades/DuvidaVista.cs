namespace QuizProuni.Api.Dados.Entidades;

public class DuvidaVista
{
    public int VisitanteId { get; set; }
    public string PerguntaId { get; set; } = string.Empty;
    public DateTimeOffset DataVisualizacao { get; set; }
}
