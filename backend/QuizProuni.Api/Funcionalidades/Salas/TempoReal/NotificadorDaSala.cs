using Microsoft.AspNetCore.SignalR;

namespace QuizProuni.Api.Funcionalidades.Salas.TempoReal;

public class NotificadorDaSala
{
    private readonly IHubContext<SalaHub> hub;

    public NotificadorDaSala(IHubContext<SalaHub> hub)
    {
        this.hub = hub;
    }

    public Task ParticipanteEntrouAsync(string codigo, List<ParticipanteBag> participantes)
    {
        return hub.Clients.Group(SalaHub.GrupoDaSala(codigo))
            .SendAsync("participante-entrou", new { participantes, total = participantes.Count });
    }

    public Task PerguntaIniciadaAsync(string codigo, PerguntaDaSalaBag pergunta)
    {
        return hub.Clients.Group(SalaHub.GrupoDaSala(codigo)).SendAsync("pergunta-iniciada", pergunta);
    }

    public Task RespostaRegistradaAsync(string codigo, int respondidas, int totalParticipantes)
    {
        return hub.Clients.Group(SalaHub.GrupoDoModerador(codigo))
            .SendAsync("resposta-registrada", new { respondidas, totalParticipantes });
    }

    public async Task PerguntaEncerradaAsync(string codigo, int ordem, ResultadoDaPerguntaBag resultado)
    {
        var grupo = hub.Clients.Group(SalaHub.GrupoDaSala(codigo));
        await grupo.SendAsync("pergunta-encerrada", new { ordem });
        await grupo.SendAsync("resultado-disponivel", resultado);
    }

    public Task QuizFinalizadoAsync(string codigo, List<LinhaDoRankingBag> podio, bool salaEncerrada)
    {
        return hub.Clients.Group(SalaHub.GrupoDaSala(codigo)).SendAsync("quiz-finalizado", new { ranking = podio, encerrada = salaEncerrada });
    }

    public Task NovaRodadaAsync(string codigo, int rodada)
    {
        return hub.Clients.Group(SalaHub.GrupoDaSala(codigo)).SendAsync("nova-rodada", new { rodada });
    }
}
