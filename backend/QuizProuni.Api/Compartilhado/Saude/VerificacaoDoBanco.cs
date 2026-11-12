using Microsoft.Extensions.Diagnostics.HealthChecks;
using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Compartilhado.Saude;

public class VerificacaoDoBanco : IHealthCheck
{
    private static readonly TimeSpan TempoMaximo = TimeSpan.FromSeconds(3);

    private readonly QuizProuniContext db;

    public VerificacaoDoBanco(QuizProuniContext db)
    {
        this.db = db;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext contexto, CancellationToken cancelamento = default)
    {
        using var limite = CancellationTokenSource.CreateLinkedTokenSource(cancelamento);
        limite.CancelAfter(TempoMaximo);

        try
        {
            return await db.Database.CanConnectAsync(limite.Token)
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy("Sem conexão com o banco.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Sem conexão com o banco.", ex);
        }
    }
}
