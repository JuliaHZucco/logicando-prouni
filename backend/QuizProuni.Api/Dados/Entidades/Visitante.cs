namespace QuizProuni.Api.Dados.Entidades;

public class Visitante
{
    public int VisitanteId { get; set; }
    public Guid Token { get; set; }
    public DateTimeOffset DataCriacao { get; set; }
    public DateTimeOffset DataUltimoAcesso { get; set; }
}
