using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using QuizProuni.Api.Compartilhado.Middlewares;
using QuizProuni.Api.Compartilhado.Seguranca;

namespace QuizProuni.Testes.Seguranca;

public class RequisicoesRecusadasTestes
{
    [Fact]
    public async Task Corpo_acima_do_limite_do_servidor_vira_413_e_nao_erro_500()
    {
        var middleware = new ExceptionMiddleware(
            _ => throw new BadHttpRequestException("Request body too large.", StatusCodes.Status413PayloadTooLarge),
            NullLogger<ExceptionMiddleware>.Instance,
            new AvisosDeLimiteExcedido(NullLogger<AvisosDeLimiteExcedido>.Instance));
        var contexto = new DefaultHttpContext();
        contexto.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(contexto);

        contexto.Response.Body.Position = 0;
        var corpo = await JsonSerializer.DeserializeAsync<JsonElement>(contexto.Response.Body);
        Assert.Equal(StatusCodes.Status413PayloadTooLarge, contexto.Response.StatusCode);
        Assert.Equal("Requisição grande demais.", corpo.GetProperty("message").GetString());
    }
}
