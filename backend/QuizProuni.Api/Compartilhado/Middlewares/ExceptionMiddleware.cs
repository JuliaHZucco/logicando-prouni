using QuizProuni.Api.Compartilhado.Excecoes;

namespace QuizProuni.Api.Compartilhado.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate proximo;
    private readonly ILogger<ExceptionMiddleware> logger;

    public ExceptionMiddleware(RequestDelegate proximo, ILogger<ExceptionMiddleware> logger)
    {
        this.proximo = proximo;
        this.logger = logger;
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
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro não tratado | {RequestId} {Metodo} {Caminho}",
                contexto.TraceIdentifier, contexto.Request.Method, contexto.Request.Path);
            await Responder(contexto, StatusCodes.Status500InternalServerError, "error", "Erro interno do servidor.", null);
        }
    }

    private static Task Responder(HttpContext contexto, int statusHttp, string tipo, string mensagem, string? codigo)
    {
        contexto.Response.StatusCode = statusHttp;
        return contexto.Response.WriteAsJsonAsync(new { type = tipo, message = mensagem, code = codigo });
    }
}
