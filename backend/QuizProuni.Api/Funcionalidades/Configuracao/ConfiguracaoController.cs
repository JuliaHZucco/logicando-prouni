using Microsoft.AspNetCore.Mvc;
using QuizProuni.Api.Compartilhado.Configuracao;

namespace QuizProuni.Api.Funcionalidades.Configuracao;

[Route("api/configuracao")]
public class ConfiguracaoController : ControllerBase
{
    private readonly IConfiguration configuracao;

    public ConfiguracaoController(IConfiguration configuracao)
    {
        this.configuracao = configuracao;
    }

    [HttpGet("publica")]
    public IActionResult Publica()
    {
        return new JsonResult(new { enderecoPublico = configuracao.LerEnderecoPublico() });
    }
}
