using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Salas.TempoReal;

public class EncerradorDePerguntasVencidas : BackgroundService
{
    private static readonly TimeSpan IntervaloDaVarredura = TimeSpan.FromMilliseconds(250);

    private readonly IServiceScopeFactory fabricaDeEscopos;
    private readonly ILogger<EncerradorDePerguntasVencidas> logger;
    private bool varreduraComFalha;

    public EncerradorDePerguntasVencidas(IServiceScopeFactory fabricaDeEscopos, ILogger<EncerradorDePerguntasVencidas> logger)
    {
        this.fabricaDeEscopos = fabricaDeEscopos;
        this.logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken parada)
    {
        using var temporizador = new PeriodicTimer(IntervaloDaVarredura);

        try
        {
            while (await temporizador.WaitForNextTickAsync(parada))
                await VarrerAsync();
        }
        catch (OperationCanceledException)
        {
        }
    }

    private async Task VarrerAsync()
    {
        try
        {
            foreach (var codigo in await ListarCodigosComPrazoVencidoAsync())
                await EncerrarAsync(codigo);

            if (varreduraComFalha)
                logger.LogInformation("A varredura das perguntas vencidas voltou ao normal.");

            varreduraComFalha = false;
        }
        catch (Exception ex)
        {
            if (!varreduraComFalha)
                logger.LogError(ex, "Erro ao procurar perguntas com o prazo vencido. Novas falhas seguidas não serão registradas.");

            varreduraComFalha = true;
        }
    }

    private async Task<List<string>> ListarCodigosComPrazoVencidoAsync()
    {
        using var escopo = fabricaDeEscopos.CreateScope();
        var db = escopo.ServiceProvider.GetRequiredService<QuizProuniContext>();

        var perguntasAbertas = await (
            from sala in db.Salas
            join salaPergunta in db.SalaPerguntas on sala.SalaId equals salaPergunta.SalaId
            join exibicao in db.Exibicoes on salaPergunta.SalaPerguntaId equals exibicao.SalaPerguntaId
            where sala.Status == ConsultasDaSala.StatusPerguntaAberta
                && sala.SegundosPorPergunta != null
                && salaPergunta.Ordem == sala.PerguntaAtual
                && exibicao.Rodada == sala.RodadaAtual
            select new { sala.Codigo, sala.SegundosPorPergunta, exibicao.DataAbertura }
        ).AsNoTracking().ToListAsync();

        return perguntasAbertas
            .Where(x => ConsultasDaSala.PrazoVencido(x.DataAbertura, x.SegundosPorPergunta))
            .Select(x => x.Codigo)
            .ToList();
    }

    private async Task EncerrarAsync(string codigo)
    {
        try
        {
            using var escopo = fabricaDeEscopos.CreateScope();
            var salaAoVivoService = escopo.ServiceProvider.GetRequiredService<SalaAoVivoService>();
            await salaAoVivoService.EncerrarPerguntaVencidaAsync(codigo);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao encerrar a pergunta vencida. Codigo: {Codigo}", codigo);
        }
    }
}
