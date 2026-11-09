using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;

namespace QuizProuni.Api.Compartilhado.Seguranca;

public class LimitadorDeNovosVisitantes : IDisposable
{
    private readonly PartitionedRateLimiter<string> limitador;

    public LimitadorDeNovosVisitantes(IOptions<LimitesDeUso> limites)
    {
        var porHora = limites.Value.NovosVisitantesPorHora;

        limitador = PartitionedRateLimiter.Create<string, string>(ip =>
            RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = porHora,
                Window = TimeSpan.FromHours(1),
                QueueLimit = 0
            }));
    }

    public bool Permitir(string ip)
    {
        using var permissao = limitador.AttemptAcquire(ip);
        return permissao.IsAcquired;
    }

    public void Dispose()
    {
        limitador.Dispose();
    }
}
