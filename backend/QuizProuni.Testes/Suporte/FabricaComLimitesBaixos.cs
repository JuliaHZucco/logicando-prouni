namespace QuizProuni.Testes.Suporte;

public class FabricaComLimitesBaixos : FabricaDaApi
{
    public const int Limite = 3;

    protected override Dictionary<string, string?> LimitesDeUso()
    {
        return new Dictionary<string, string?>
        {
            ["Seguranca:Limites:LoginsPorMinuto"] = Limite.ToString(),
            ["Seguranca:Limites:AcessosASalaPorMinuto"] = Limite.ToString(),
            ["Seguranca:Limites:NovosVisitantesPorHora"] = Limite.ToString()
        };
    }
}
