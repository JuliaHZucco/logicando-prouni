using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

public class TokenModerador
{
    public static readonly TimeSpan Duracao = TimeSpan.FromHours(12);

    private readonly SymmetricSecurityKey chave;

    public TokenModerador(IConfiguration configuracao)
    {
        var textoDaChave = configuracao["Jwt:Chave"];
        if (string.IsNullOrWhiteSpace(textoDaChave) || textoDaChave.Length < 32)
            throw new InvalidOperationException("Configure Jwt:Chave com pelo menos 32 caracteres.");

        chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(textoDaChave));
    }

    public string Criar(int moderadorId)
    {
        var token = new JwtSecurityToken(
            claims: new[] { new Claim(JwtRegisteredClaimNames.Sub, moderadorId.ToString()) },
            expires: DateTime.UtcNow.Add(Duracao),
            signingCredentials: new SigningCredentials(chave, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public int? Ler(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var parametros = new TokenValidationParameters
        {
            IssuerSigningKey = chave,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var manipulador = new JwtSecurityTokenHandler { MapInboundClaims = false };
            var principal = manipulador.ValidateToken(token, parametros, out _);
            var identificador = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            return int.TryParse(identificador, out var moderadorId) ? moderadorId : null;
        }
        catch (Exception ex) when (ex is SecurityTokenException || ex is ArgumentException)
        {
            return null;
        }
    }
}
