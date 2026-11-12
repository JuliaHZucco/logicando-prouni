namespace QuizProuni.Testes.Suporte;

public class FabricaComProxyReverso : FabricaDaApi
{
    public const int Limite = 3;

    protected override Dictionary<string, string?> LimitesDeUso()
    {
        var configuracao = base.LimitesDeUso();
        configuracao["Seguranca:Limites:NovosVisitantesPorHora"] = Limite.ToString();
        configuracao["ProxyReverso:Ativo"] = "true";
        return configuracao;
    }
}
