using System.Collections.Concurrent;

namespace QuizProuni.Api.Funcionalidades.Salas.TempoReal;

public class CronometroDasSalas
{
    private readonly ConcurrentDictionary<string, CancellationTokenSource> cronometrosPorSala = new();
    private readonly IServiceScopeFactory fabricaDeEscopos;
    private readonly ILogger<CronometroDasSalas> logger;

    public CronometroDasSalas(IServiceScopeFactory fabricaDeEscopos, ILogger<CronometroDasSalas> logger)
    {
        this.fabricaDeEscopos = fabricaDeEscopos;
        this.logger = logger;
    }

    public void Agendar(string codigo, int segundos)
    {
        Cancelar(codigo);

        var cancelamento = new CancellationTokenSource();
        cronometrosPorSala[codigo] = cancelamento;

        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(segundos), cancelamento.Token);

                using var escopo = fabricaDeEscopos.CreateScope();
                var salaAoVivoService = escopo.ServiceProvider.GetRequiredService<SalaAoVivoService>();
                await salaAoVivoService.EncerrarPerguntaAsync(null, codigo);
            }
            catch (OperationCanceledException)
            {
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao encerrar a pergunta pelo cronômetro. Codigo: {Codigo}", codigo);
            }
        });
    }

    public void Cancelar(string codigo)
    {
        if (cronometrosPorSala.TryRemove(codigo, out var cancelamento))
            cancelamento.Cancel();
    }
}
