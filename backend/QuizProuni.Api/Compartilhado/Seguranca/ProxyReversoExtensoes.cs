using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

namespace QuizProuni.Api.Compartilhado.Seguranca;

public static class ProxyReversoExtensoes
{
    public const string Secao = "ProxyReverso";

    public static bool ProxyReversoAtivo(this IConfiguration configuracao)
    {
        return configuracao.GetSection(Secao).GetValue<bool>("Ativo");
    }

    public static IServiceCollection AddProxyReverso(this IServiceCollection servicos)
    {
        servicos.AddOptions<ForwardedHeadersOptions>().Configure<IConfiguration>(Configurar);
        return servicos;
    }

    private static void Configurar(ForwardedHeadersOptions opcoes, IConfiguration configuracao)
    {
        if (!configuracao.ProxyReversoAtivo())
            return;

        var secao = configuracao.GetSection(Secao);
        var limiteDeProxies = secao.GetValue<int?>("LimiteDeProxies") ?? 1;
        if (limiteDeProxies < 1)
            throw new InvalidOperationException($"{Secao}:LimiteDeProxies deve ser 1 ou mais.");

        opcoes.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        opcoes.ForwardLimit = limiteDeProxies;

        foreach (var texto in LerLista(secao, "IPsConfiaveis"))
            opcoes.KnownProxies.Add(LerIp(texto));

        foreach (var texto in LerLista(secao, "RedesConfiaveis"))
            opcoes.KnownIPNetworks.Add(LerRede(texto));
    }

    public static WebApplication UseProxyReverso(this WebApplication app)
    {
        if (app.Configuration.ProxyReversoAtivo())
            app.UseForwardedHeaders();

        return app;
    }

    private static IEnumerable<string> LerLista(IConfigurationSection secao, string nome)
    {
        return (secao.GetSection(nome).Get<string[]>() ?? []).Where(texto => !string.IsNullOrWhiteSpace(texto));
    }

    private static IPAddress LerIp(string texto)
    {
        if (!IPAddress.TryParse(texto.Trim(), out var ip))
            throw new InvalidOperationException($"{Secao}:IPsConfiaveis tem um IP inválido: \"{texto}\".");

        return ip;
    }

    private static System.Net.IPNetwork LerRede(string texto)
    {
        if (!System.Net.IPNetwork.TryParse(texto.Trim(), out var rede))
            throw new InvalidOperationException($"{Secao}:RedesConfiaveis tem uma rede inválida: \"{texto}\". Use o formato 10.0.0.0/8.");

        return rede;
    }
}
