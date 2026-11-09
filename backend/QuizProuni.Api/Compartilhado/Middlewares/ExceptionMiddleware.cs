using QuizProuni.Api.Compartilhado.Excecoes;
using QuizProuni.Api.Compartilhado.Seguranca;

namespace QuizProuni.Api.Compartilhado.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate proximo;
    private readonly ILogger<ExceptionMiddleware> logger;
    private readonly AvisosDeLimiteExcedido avisosDeLimiteExcedido;

    public ExceptionMiddleware(RequestDelegate proximo, ILogger<ExceptionMiddleware> logger, AvisosDeLimiteExcedido avisosDeLimiteExcedido)
    {
        this.proximo = proximo;
        this.logger = logger;
        this.avisosDeLimiteExcedido = avisosDeLimiteExcedido;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await proximo(contexto);
        }
        catch (BLException ex)
        {
            logger.LogWarning("Erro de negócio | {RequestId} {Metodo} {Caminho} | codigo={Codigo} {Mensagem}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path, ex.Codigo, ex.Message);
            await Responder(contexto, StatusCodes.Status400BadRequest, "error", ex.Message, ex.Codigo);
        }
        catch (ConflitoException ex)
        {
            logger.LogWarning("Conflito | {RequestId} {Metodo} {Caminho} | codigo={Codigo} {Mensagem}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path, ex.Codigo, ex.Message);
            await Responder(contexto, StatusCodes.Status409Conflict, "conflict", ex.Message, ex.Codigo);
        }
        catch (LimiteExcedidoException ex)
        {
            avisosDeLimiteExcedido.Registrar(contexto);
            await Responder(contexto, StatusCodes.Status429TooManyRequests, "tooManyRequests", ex.Message, LimiteExcedidoException.Codigo);
        }
        catch (NaoAutorizadoException ex)
        {
            logger.LogInformation("Não autorizado | {RequestId} {Metodo} {Caminho} | {Mensagem}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path, ex.Message);
            await Responder(contexto, StatusCodes.Status401Unauthorized, "unauthorized", ex.Message, null);
        }
        catch (AcessoNegadoException ex)
        {
            logger.LogWarning("Acesso negado | {RequestId} {Metodo} {Caminho} | {Mensagem}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path, ex.Message);
            await Responder(contexto, StatusCodes.Status403Forbidden, "forbidden", ex.Message, null);
        }
        catch (NaoEncontradoException ex)
        {
            logger.LogInformation("Recurso não encontrado | {RequestId} {Metodo} {Caminho} | {Mensagem}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path, ex.Message);
            await Responder(contexto, StatusCodes.Status404NotFound, "notFound", ex.Message, null);
        }
        catch (BadHttpRequestException ex)
        {
            logger.LogInformation("Requisição recusada | {RequestId} {Metodo} {Caminho} | {Mensagem}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path, ex.Message);
            var mensagem = ex.StatusCode == StatusCodes.Status413PayloadTooLarge ? "Requisição grande demais." : "Requisição inválida.";
            await Responder(contexto, ex.StatusCode, "error", mensagem, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro não tratado | {RequestId} {Metodo} {Caminho}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path);
            await Responder(contexto, StatusCodes.Status500InternalServerError, "error", "Erro interno do servidor.", null);
        }
    }

    public static Task Responder(HttpContext contexto, int statusHttp, string tipo, string mensagem, string? codigo)
    {
        contexto.Response.StatusCode = statusHttp;
        return contexto.Response.WriteAsJsonAsync(new { type = tipo, message = mensagem, code = codigo });
    }
}
