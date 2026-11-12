namespace QuizProuni.Api.Compartilhado.Middlewares;

/// <summary>
/// Acrescenta cabeçalhos de segurança a todas as respostas. O HSTS e o redirecionamento para HTTPS
/// ficam de fora de propósito: dependem de quem encerra o HTTPS (a API ou o proxy da hospedagem).
/// </summary>
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

    // Tudo vem do próprio site. O tempo real usa WebSocket no mesmo endereço, e alguns navegadores mais antigos
    // não tratam ws:// e wss:// como "mesma origem", então o endereço é liberado de forma explícita.
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
