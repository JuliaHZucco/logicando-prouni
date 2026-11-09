namespace QuizProuni.Api.Compartilhado.Seguranca;

public class LimitesDeUso
{
    public const string Secao = "Seguranca:Limites";

    public int LoginsPorMinuto { get; set; } = 10;
    public int AcessosASalaPorMinuto { get; set; } = 600;
    public int NovosVisitantesPorHora { get; set; } = 1000;
}
