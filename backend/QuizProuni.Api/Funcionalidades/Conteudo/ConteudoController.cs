using Microsoft.AspNetCore.Mvc;

namespace QuizProuni.Api.Funcionalidades.Conteudo;

[Route("api/conteudo")]
public class ConteudoController : ControllerBase
{
    private readonly ConteudoService conteudoService;

    public ConteudoController(ConteudoService conteudoService)
    {
        this.conteudoService = conteudoService;
    }

    [HttpGet]
    public async Task<IActionResult> Obter()
    {
        var response = await conteudoService.ObterConteudoAsync();
        response.LancarSeHouverErro();

        return new JsonResult(response.Categorias);
    }
}
