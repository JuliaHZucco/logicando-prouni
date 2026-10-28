using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Funcionalidades.Visitantes;

public class VisitanteContexto
{
    private const string NomeDoCookie = "visitante";

    private readonly QuizProuniContext db;
    private readonly IHttpContextAccessor acessoAoHttp;

    public VisitanteContexto(QuizProuniContext db, IHttpContextAccessor acessoAoHttp)
    {
        this.db = db;
        this.acessoAoHttp = acessoAoHttp;
    }

    public Task<int?> ObterVisitanteIdAsync()
    {
        return ObterVisitanteIdAsync(acessoAoHttp.HttpContext!);
    }

    public async Task<int?> ObterVisitanteIdAsync(HttpContext contextoHttp)
    {
        if (!contextoHttp.Request.Cookies.TryGetValue(NomeDoCookie, out var valorDoCookie))
            return null;

        if (!Guid.TryParse(valorDoCookie, out var token))
            return null;

        var visitante = await db.Visitantes.FirstOrDefaultAsync(x => x.Token == token);
        if (visitante == null)
            return null;

        visitante.DataUltimoAcesso = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return visitante.VisitanteId;
    }

    public async Task<int> ObterOuCriarVisitanteIdAsync()
    {
        var visitanteId = await ObterVisitanteIdAsync();
        if (visitanteId != null)
            return visitanteId.Value;

        var novoVisitante = new Visitante();
        db.Visitantes.Add(novoVisitante);
        await db.SaveChangesAsync();

        var contextoHttp = acessoAoHttp.HttpContext!;
        contextoHttp.Response.Cookies.Append(NomeDoCookie, novoVisitante.Token.ToString(), new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = contextoHttp.Request.IsHttps,
            MaxAge = TimeSpan.FromDays(365)
        });

        return novoVisitante.VisitanteId;
    }
}
