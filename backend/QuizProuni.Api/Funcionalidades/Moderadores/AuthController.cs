using Microsoft.AspNetCore.Mvc;
using QuizProuni.Api.Compartilhado.Excecoes;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService authService;
    private readonly ModeradorContexto moderadorContexto;

    public AuthController(AuthService authService, ModeradorContexto moderadorContexto)
    {
        this.authService = authService;
        this.moderadorContexto = moderadorContexto;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            throw new BLException("Dados inválidos.", "DadosInvalidos");

        var response = await authService.LoginAsync(request);
        response.LancarSeHouverErro();

        moderadorContexto.IniciarSessao(response.ModeradorId);
        return new JsonResult(new { response.Email });
    }

    [HttpGet("eu")]
    public async Task<IActionResult> ObterModeradorLogado()
    {
        var moderadorId = moderadorContexto.ExigirModeradorId();

        var response = await authService.ObterModeradorAsync(moderadorId);
        response.LancarSeHouverErro();

        return new JsonResult(new { response.Email });
    }

    [HttpPost("sair")]
    public IActionResult Sair()
    {
        moderadorContexto.EncerrarSessao();
        return NoContent();
    }
}
