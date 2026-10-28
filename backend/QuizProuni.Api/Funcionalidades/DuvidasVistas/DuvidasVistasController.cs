using Microsoft.AspNetCore.Mvc;
using QuizProuni.Api.Compartilhado.Excecoes;
using QuizProuni.Api.Funcionalidades.Visitantes;

namespace QuizProuni.Api.Funcionalidades.DuvidasVistas;

[Route("api/duvidas-vistas")]
public class DuvidasVistasController : ControllerBase
{
    private readonly DuvidasVistasService duvidasVistasService;
    private readonly VisitanteContexto visitanteContexto;

    public DuvidasVistasController(DuvidasVistasService duvidasVistasService, VisitanteContexto visitanteContexto)
    {
        this.duvidasVistasService = duvidasVistasService;
        this.visitanteContexto = visitanteContexto;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var visitanteId = await visitanteContexto.ObterVisitanteIdAsync();

        var response = await duvidasVistasService.ListarAsync(visitanteId);
        response.LancarSeHouverErro();

        return new JsonResult(response.DuvidasIds);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarDuvidaVistaRequest request)
    {
        if (!ModelState.IsValid)
            throw new BLException("Dados inválidos.", "DadosInvalidos");

        var visitanteId = await visitanteContexto.ObterOuCriarVisitanteIdAsync();

        var response = await duvidasVistasService.RegistrarAsync(visitanteId, request);
        response.LancarSeHouverErro();

        return new JsonResult(new { success = true });
    }
}
