using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using QuizProuni.Api.Compartilhado.Excecoes;
using QuizProuni.Api.Compartilhado.Middlewares;

namespace QuizProuni.Api.Compartilhado.Seguranca;

public static class LimitesDeUsoExtensoes
{
    public static IServiceCollection AddLimitesDeUso(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.Configure<LimitesDeUso>(configuracao.GetSection(LimitesDeUso.Secao));
        servicos.AddSingleton<AvisosDeLimiteExcedido>();
        servicos.AddSingleton<LimitadorDeNovosVisitantes>();

        servicos.AddRateLimiter(_ => { });
        servicos.AddOptions<RateLimiterOptions>().Configure<IOptions<LimitesDeUso>>(ConfigurarPoliticas);

        return servicos;
    }

    private static void ConfigurarPoliticas(RateLimiterOptions opcoes, IOptions<LimitesDeUso> limites)
    {
        opcoes.AddPolicy(PoliticasDeLimite.Login, contexto => PorMinuto(contexto, limites.Value.LoginsPorMinuto));
        opcoes.AddPolicy(PoliticasDeLimite.AcessoASala, contexto => PorMinuto(contexto, limites.Value.AcessosASalaPorMinuto));
        opcoes.OnRejected = RecusarAsync;
    }

    private static RateLimitPartition<string> PorMinuto(HttpContext contexto, int limite)
    {
        return RateLimitPartition.GetFixedWindowLimiter(OrigemDaRequisicao.Ip(contexto), _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = limite,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    }

    private static async ValueTask RecusarAsync(OnRejectedContext contexto, CancellationToken cancelamento)
    {
        var contextoHttp = contexto.HttpContext;
        contextoHttp.RequestServices.GetRequiredService<AvisosDeLimiteExcedido>().Registrar(contextoHttp);

        if (contexto.Lease.TryGetMetadata(MetadataName.RetryAfter, out var espera))
            contextoHttp.Response.Headers.RetryAfter = ((int)Math.Ceiling(espera.TotalSeconds)).ToString(CultureInfo.InvariantCulture);

        await ExceptionMiddleware.Responder(
            contextoHttp,
            StatusCodes.Status429TooManyRequests,
            "tooManyRequests",
            LimiteExcedidoException.MensagemPadrao,
            LimiteExcedidoException.Codigo);
    }
}
