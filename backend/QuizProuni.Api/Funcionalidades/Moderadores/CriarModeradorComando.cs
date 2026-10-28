using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Funcionalidades.Moderadores;

public static class CriarModeradorComando
{
    public const string Nome = "criar-moderador";
    public const int TamanhoMinimoDaSenha = 8;
    public const int TamanhoMaximoDoEmail = 255;

    public static async Task<(bool Sucesso, string Mensagem)> ExecutarAsync(QuizProuniContext db, string[] argumentos)
    {
        if (argumentos.Length != 2)
            return (false, $"Uso: dotnet run --project backend/QuizProuni.Api -- {Nome} <email> <senha>");

        var email = argumentos[0].Trim().ToLowerInvariant();
        var senha = argumentos[1];

        if (!EmailPareceValido(email))
            return (false, "Informe um e-mail válido.");

        if (senha.Length < TamanhoMinimoDaSenha)
            return (false, $"A senha deve ter pelo menos {TamanhoMinimoDaSenha} caracteres.");

        if (await db.Moderadores.AnyAsync(x => x.Email == email))
            return (false, $"Já existe um moderador com o e-mail {email}.");

        db.Moderadores.Add(new Moderador { Email = email, SenhaHash = BCrypt.Net.BCrypt.HashPassword(senha) });
        await db.SaveChangesAsync();

        return (true, $"Moderador cadastrado: {email}");
    }

    private static bool EmailPareceValido(string email)
    {
        if (email.Length == 0 || email.Length > TamanhoMaximoDoEmail || email.Contains(' '))
            return false;

        var partes = email.Split('@');
        return partes.Length == 2 && partes[0].Length > 0 && partes[1].Contains('.') && !partes[1].StartsWith('.') && !partes[1].EndsWith('.');
    }
}
