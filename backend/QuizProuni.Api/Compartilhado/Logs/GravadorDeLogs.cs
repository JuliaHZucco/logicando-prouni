using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Compartilhado.Logs;

public class GravadorDeLogs : BackgroundService
{
    private const int TamanhoMaximoDoLote = 100;

    private readonly FilaDeLogs fila;
    private readonly IServiceScopeFactory fabricaDeEscopos;

    public GravadorDeLogs(FilaDeLogs fila, IServiceScopeFactory fabricaDeEscopos)
    {
        this.fila = fila;
        this.fabricaDeEscopos = fabricaDeEscopos;
    }

    protected override async Task ExecuteAsync(CancellationToken parada)
    {
        try
        {
            while (await fila.Leitor.WaitToReadAsync(parada))
                await GravarAsync(LerLote());
        }
        catch (OperationCanceledException)
        {
        }

        var restantes = LerLote();
        while (restantes.Count > 0)
        {
            await GravarAsync(restantes);
            restantes = LerLote();
        }
    }

    private List<RegistroDeLog> LerLote()
    {
        var lote = new List<RegistroDeLog>();
        while (lote.Count < TamanhoMaximoDoLote && fila.Leitor.TryRead(out var registro))
            lote.Add(registro);

        return lote;
    }

    private async Task GravarAsync(List<RegistroDeLog> lote)
    {
        if (lote.Count == 0)
            return;

        try
        {
            using var escopo = fabricaDeEscopos.CreateScope();
            var db = escopo.ServiceProvider.GetRequiredService<QuizProuniContext>();
            db.Logs.AddRange(lote);
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Não foi possível gravar {lote.Count} log(s) no banco: {ex.Message}");
        }
    }
}
