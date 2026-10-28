using Microsoft.AspNetCore.Mvc;
using QuizProuni.Api.Compartilhado.Excecoes;
using QuizProuni.Api.Funcionalidades.Visitantes;

namespace QuizProuni.Api.Funcionalidades.Quiz;

[Route("api/quiz")]
public class QuizController : ControllerBase
{
    private readonly QuizService quizService;
    private readonly VisitanteContexto visitanteContexto;

    public QuizController(QuizService quizService, VisitanteContexto visitanteContexto)
    {
        this.quizService = quizService;
        this.visitanteContexto = visitanteContexto;
    }

    [HttpPost("partidas")]
    public async Task<IActionResult> CriarPartida([FromBody] CriarPartidaRequest request)
    {
        if (!ModelState.IsValid)
            throw new BLException("Dados inválidos.", "DadosInvalidos");

        var visitanteId = await visitanteContexto.ObterOuCriarVisitanteIdAsync();

        var response = await quizService.CriarPartidaAsync(visitanteId, request);
        response.LancarSeHouverErro();

        return new JsonResult(new { response.PartidaId, response.Perguntas }) { StatusCode = StatusCodes.Status201Created };
    }

    [HttpPost("partidas/{partidaId:int}/respostas")]
    public async Task<IActionResult> Responder(int partidaId, [FromBody] ResponderPerguntaRequest request)
    {
        if (!ModelState.IsValid)
            throw new BLException("Dados inválidos.", "DadosInvalidos");

        var visitanteId = await visitanteContexto.ObterOuCriarVisitanteIdAsync();

        var response = await quizService.ResponderAsync(visitanteId, partidaId, request);
        response.LancarSeHouverErro();

        return new JsonResult(new
        {
            response.Correta,
            response.AlternativaCorretaId,
            response.Explicacao,
            response.BaseDuvidaId
        });
    }

    [HttpGet("partidas/{partidaId:int}/resultado")]
    public async Task<IActionResult> ObterResultado(int partidaId)
    {
        var visitanteId = await visitanteContexto.ObterVisitanteIdAsync();

        var response = await quizService.ObterResultadoAsync(visitanteId, partidaId);
        response.LancarSeHouverErro();

        return new JsonResult(new
        {
            response.PartidaId,
            response.Finalizada,
            response.TotalPerguntas,
            response.Acertos,
            response.PercentualAcerto,
            response.AproveitamentoPositivo,
            response.Itens
        });
    }
}
