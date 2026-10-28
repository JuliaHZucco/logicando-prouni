using QuizProuni.Api.Compartilhado.Excecoes;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

public class ModeradorContexto
{
    public const string NomeDoCookie = "moderador";

    private readonly TokenModerador tokenModerador;
    private readonly IHttpContextAccessor acessoAoHttp;

    public ModeradorContexto(TokenModerador tokenModerador, IHttpContextAccessor acessoAoHttp)
    {
        this.tokenModerador = tokenModerador;
        this.acessoAoHttp = acessoAoHttp;
    }

    public int? ObterModeradorId()
    {
        return ObterModeradorId(acessoAoHttp.HttpContext!);
    }

    public int? ObterModeradorId(HttpContext contextoHttp)
    {
        contextoHttp.Request.Cookies.TryGetValue(NomeDoCookie, out var token);
        return tokenModerador.Ler(token);
    }

    public int ExigirModeradorId()
    {
        return ObterModeradorId() ?? throw new NaoAutorizadoException("Entre como moderador para continuar.");
    }

    public void IniciarSessao(int moderadorId)
    {
        var contextoHttp = acessoAoHttp.HttpContext!;
        contextoHttp.Response.Cookies.Append(NomeDoCookie, tokenModerador.Criar(moderadorId), new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = contextoHttp.Request.IsHttps,
            MaxAge = TokenModerador.Duracao
        });
    }

    public void EncerrarSessao()
    {
        acessoAoHttp.HttpContext!.Response.Cookies.Delete(NomeDoCookie);
    }
}
