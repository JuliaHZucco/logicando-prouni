using System.Collections.Concurrent;

namespace QuizProuni.Api.Compartilhado.Seguranca;

public class AvisosDeLimiteExcedido
{
    private const int MaximoDeOrigensLembradas = 10000;
    private static readonly TimeSpan IntervaloEntreAvisos = TimeSpan.FromMinutes(1);

    private readonly ConcurrentDictionary<string, DateTimeOffset> ultimosAvisos = new();
    private readonly ILogger<AvisosDeLimiteExcedido> logger;

    public AvisosDeLimiteExcedido(ILogger<AvisosDeLimiteExcedido> logger)
    {
        this.logger = logger;
    }

    public void Registrar(HttpContext contexto)
    {
        var ip = OrigemDaRequisicao.Ip(contexto);
        if (!DevePublicar(ip))
            return;

        logger.LogWarning("Limite de uso excedido | {RequestId} {Metodo} {Caminho} | ip={Ip}",
            contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path, ip);
    }

    private bool DevePublicar(string ip)
    {
        if (ultimosAvisos.Count >= MaximoDeOrigensLembradas)
            ultimosAvisos.Clear();

        var agora = DateTimeOffset.UtcNow;
        var publicar = false;

        ultimosAvisos.AddOrUpdate(
            ip,
            _ =>
            {
                publicar = true;
                return agora;
            },
            (_, ultimoAviso) =>
            {
                publicar = agora - ultimoAviso >= IntervaloEntreAvisos;
                return publicar ? agora : ultimoAviso;
            });

        return publicar;
    }
}
