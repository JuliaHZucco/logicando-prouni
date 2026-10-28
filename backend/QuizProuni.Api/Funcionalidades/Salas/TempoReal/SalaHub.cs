using Microsoft.AspNetCore.SignalR;
using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Funcionalidades.Moderadores;
using QuizProuni.Api.Funcionalidades.Visitantes;

namespace QuizProuni.Api.Funcionalidades.Salas.TempoReal;

public record ResultadoDoHub(bool Ok, string? Erro = null);

public class SalaHub : Hub
{
    private const string ChaveDoModerador = "moderadorId";
    private const string ChaveDoVisitante = "visitanteId";

    private readonly ModeradorContexto moderadorContexto;
    private readonly VisitanteContexto visitanteContexto;
    private readonly SalaService salaService;
    private readonly SalaAoVivoService salaAoVivoService;

    public SalaHub(
        ModeradorContexto moderadorContexto,
        VisitanteContexto visitanteContexto,
        SalaService salaService,
        SalaAoVivoService salaAoVivoService)
    {
        this.moderadorContexto = moderadorContexto;
        this.visitanteContexto = visitanteContexto;
        this.salaService = salaService;
        this.salaAoVivoService = salaAoVivoService;
    }

    public static string GrupoDaSala(string codigo) => $"sala:{ConsultasDaSala.NormalizarCodigo(codigo)}";

    public static string GrupoDoModerador(string codigo) => $"moderador:{ConsultasDaSala.NormalizarCodigo(codigo)}";

    public override async Task OnConnectedAsync()
    {
        var contextoHttp = Context.GetHttpContext()!;
        Context.Items[ChaveDoModerador] = moderadorContexto.ObterModeradorId(contextoHttp);
        Context.Items[ChaveDoVisitante] = await visitanteContexto.ObterVisitanteIdAsync(contextoHttp);
        await base.OnConnectedAsync();
    }

    public async Task<ResultadoDoHub> EntrarSala(string codigo)
    {
        var (dono, participante) = await salaService.VerificarAcessoAsync(codigo, ModeradorId, VisitanteId);
        if (!dono && !participante)
            return new ResultadoDoHub(false, "Sem acesso a esta sala.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GrupoDaSala(codigo));
        if (dono)
            await Groups.AddToGroupAsync(Context.ConnectionId, GrupoDoModerador(codigo));

        return new ResultadoDoHub(true);
    }

    public async Task<ResultadoDoHub> Responder(string codigo, int alternativaId)
    {
        if (VisitanteId == null)
            return new ResultadoDoHub(false, "Resposta não aceita.");

        return Converter(await salaAoVivoService.ResponderAsync(VisitanteId.Value, codigo, alternativaId));
    }

    public async Task<ResultadoDoHub> Avancar(string codigo)
    {
        if (ModeradorId == null)
            return SemPermissao();

        return Converter(await salaAoVivoService.AvancarAsync(ModeradorId.Value, codigo));
    }

    public async Task<ResultadoDoHub> EncerrarPergunta(string codigo)
    {
        if (ModeradorId == null)
            return SemPermissao();

        return Converter(await salaAoVivoService.EncerrarPerguntaAsync(ModeradorId.Value, codigo));
    }

    public async Task<ResultadoDoHub> JogarNovamente(string codigo)
    {
        if (ModeradorId == null)
            return SemPermissao();

        return Converter(await salaAoVivoService.JogarNovamenteAsync(ModeradorId.Value, codigo));
    }

    public async Task<ResultadoDoHub> EncerrarSala(string codigo)
    {
        if (ModeradorId == null)
            return SemPermissao();

        return Converter(await salaAoVivoService.EncerrarSalaAsync(ModeradorId.Value, codigo));
    }

    private int? ModeradorId => Context.Items[ChaveDoModerador] as int?;

    private int? VisitanteId => Context.Items[ChaveDoVisitante] as int?;

    private static ResultadoDoHub SemPermissao()
    {
        return new ResultadoDoHub(false, "Só o moderador pode fazer isso.");
    }

    private static ResultadoDoHub Converter(RespostaBase resposta)
    {
        return resposta.TemErro ? new ResultadoDoHub(false, resposta.Erro) : new ResultadoDoHub(true);
    }
}
