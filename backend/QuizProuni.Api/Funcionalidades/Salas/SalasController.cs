using Microsoft.AspNetCore.Mvc;
using QuizProuni.Api.Compartilhado.Excecoes;
using QuizProuni.Api.Funcionalidades.Moderadores;
using QuizProuni.Api.Funcionalidades.Salas.TempoReal;
using QuizProuni.Api.Funcionalidades.Visitantes;

namespace QuizProuni.Api.Funcionalidades.Salas;

[Route("api/salas")]
public class SalasController : ControllerBase
{
    private readonly SalaService salaService;
    private readonly ModeradorContexto moderadorContexto;
    private readonly VisitanteContexto visitanteContexto;
    private readonly NotificadorDaSala notificador;

    public SalasController(
        SalaService salaService,
        ModeradorContexto moderadorContexto,
        VisitanteContexto visitanteContexto,
        NotificadorDaSala notificador)
    {
        this.salaService = salaService;
        this.moderadorContexto = moderadorContexto;
        this.visitanteContexto = visitanteContexto;
        this.notificador = notificador;
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarSalaRequest request)
    {
        var moderadorId = moderadorContexto.ExigirModeradorId();

        if (!ModelState.IsValid)
            throw new BLException("Dados inválidos.", "DadosInvalidos");

        var response = await salaService.CriarAsync(moderadorId, request);
        response.LancarSeHouverErro();

        return new JsonResult(new { response.Codigo }) { StatusCode = StatusCodes.Status201Created };
    }

    [HttpGet("minhas")]
    public async Task<IActionResult> ListarMinhas([FromQuery] string? busca, [FromQuery] string? estado, [FromQuery] DateOnly? de, [FromQuery] DateOnly? ate)
    {
        var moderadorId = moderadorContexto.ExigirModeradorId();

        var response = await salaService.ListarMinhasAsync(moderadorId, busca, estado, de, ate);
        response.LancarSeHouverErro();

        return new JsonResult(response.Salas);
    }

    [HttpGet("{codigo}/ranking")]
    public async Task<IActionResult> ObterRankingGeral(string codigo)
    {
        var moderadorId = moderadorContexto.ExigirModeradorId();

        var response = await salaService.ObterRankingGeralAsync(moderadorId, codigo);
        response.LancarSeHouverErro();

        return new JsonResult(response.Ranking);
    }

    [HttpPost("{codigo}/participantes")]
    public async Task<IActionResult> Entrar(string codigo, [FromBody] EntrarNaSalaRequest? request)
    {
        var visitanteId = await visitanteContexto.ObterOuCriarVisitanteIdAsync();

        var response = await salaService.EntrarAsync(visitanteId, codigo, request ?? new EntrarNaSalaRequest());
        response.LancarSeHouverErro();

        if (!response.Reconectado)
            await notificador.ParticipanteEntrouAsync(codigo, response.Participantes);

        var statusHttp = response.Reconectado ? StatusCodes.Status200OK : StatusCodes.Status201Created;
        return new JsonResult(new { response.Participante, response.Reconectado }) { StatusCode = statusHttp };
    }

    [HttpGet("{codigo}/estado")]
    public async Task<IActionResult> ObterEstado(string codigo)
    {
        var moderadorId = moderadorContexto.ObterModeradorId();
        var visitanteId = await visitanteContexto.ObterVisitanteIdAsync();

        var response = await salaService.ObterEstadoAsync(moderadorId, visitanteId, codigo);
        response.LancarSeHouverErro();

        return new JsonResult(response.Estado);
    }
}
