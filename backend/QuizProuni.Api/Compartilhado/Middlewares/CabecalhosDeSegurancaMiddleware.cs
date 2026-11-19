namespace QuizProuni.Api.Compartilhado.Middlewares;

public class CabecalhosDeSegurancaMiddleware
{
    private readonly RequestDelegate proximo;

    public CabecalhosDeSegurancaMiddleware(RequestDelegate proximo)
    {
        this.proximo = proximo;
    }

    public Task InvokeAsync(HttpContext contexto)
    {
        var cabecalhos = contexto.Response.Headers;
        cabecalhos["X-Content-Type-Options"] = "nosniff";
        cabecalhos["X-Frame-Options"] = "DENY";
        cabecalhos["Referrer-Policy"] = "strict-origin-when-cross-origin";
        cabecalhos["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";
        cabecalhos["Content-Security-Policy"] = MontarPoliticaDeConteudo(contexto.Request.Host);

        return proximo(contexto);
    }

    private static string MontarPoliticaDeConteudo(HostString host)
    {
        var endereco = host.Value;

        return string.Join("; ",
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self'",
            "img-src 'self' data:",
            "font-src 'self'",
            "media-src 'self'",
            $"connect-src 'self' ws://{endereco} wss://{endereco}",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'");
    }
}
