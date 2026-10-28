using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Funcionalidades.Salas.TempoReal;

namespace QuizProuni.Api.Funcionalidades.Salas;

public class SalaAoVivoService
{
    private readonly QuizProuniContext db;
    private readonly ILogger<SalaAoVivoService> logger;
    private readonly NotificadorDaSala notificador;
    private readonly CronometroDasSalas cronometro;

    public SalaAoVivoService(
        QuizProuniContext db,
        ILogger<SalaAoVivoService> logger,
        NotificadorDaSala notificador,
        CronometroDasSalas cronometro)
    {
        this.db = db;
        this.logger = logger;
        this.notificador = notificador;
        this.cronometro = cronometro;
    }

    public async Task<RespostaBase> AvancarAsync(int moderadorId, string codigo)
    {
        var response = await PartidaAoVivoRegras.AvancarAsync(db, moderadorId, codigo, logger);
        if (response.TemErro)
            return response;

        if (response.IrParaRanking)
        {
            await notificador.QuizFinalizadoAsync(response.Codigo, response.Podio, salaEncerrada: false);
            return response;
        }

        await notificador.PerguntaIniciadaAsync(response.Codigo, response.Pergunta!);
        if (response.SegundosPorPergunta != null)
            cronometro.Agendar(response.Codigo, response.SegundosPorPergunta.Value);

        return response;
    }

    public async Task<RespostaBase> EncerrarPerguntaAsync(int? moderadorId, string codigo)
    {
        var response = await PartidaAoVivoRegras.EncerrarPerguntaAsync(db, moderadorId, codigo, logger);
        if (response.TemErro)
            return response;

        cronometro.Cancelar(response.Codigo);
        await notificador.PerguntaEncerradaAsync(response.Codigo, response.Ordem, response.Resultado);
        return response;
    }

    public async Task<RespostaBase> EncerrarSalaAsync(int moderadorId, string codigo)
    {
        var response = await PartidaAoVivoRegras.EncerrarSalaAsync(db, moderadorId, codigo, logger);
        if (response.TemErro)
            return response;

        cronometro.Cancelar(response.Codigo);
        await notificador.QuizFinalizadoAsync(response.Codigo, response.Podio, salaEncerrada: true);
        return response;
    }

    public async Task<RespostaBase> JogarNovamenteAsync(int moderadorId, string codigo)
    {
        var response = await PartidaAoVivoRegras.JogarNovamenteAsync(db, moderadorId, codigo, logger);
        if (response.TemErro)
            return response;

        await notificador.NovaRodadaAsync(response.Codigo, response.Rodada);
        return response;
    }

    public async Task<RespostaBase> ResponderAsync(int visitanteId, string codigo, int alternativaId)
    {
        var response = await PartidaAoVivoRegras.ResponderAsync(db, visitanteId, codigo, alternativaId, logger);
        if (response.TemErro)
            return response;

        await notificador.RespostaRegistradaAsync(ConsultasDaSala.NormalizarCodigo(codigo), response.Respondidas, response.TotalParticipantes);
        return response;
    }
}
