using System.Reflection;

namespace QuizProuni.Api.Dados.Migrations;

public static class ScriptSql
{
    public static string Ler(string nomeDoArquivo)
    {
        var assembly = Assembly.GetExecutingAssembly();
        using var fluxo = assembly.GetManifestResourceStream(nomeDoArquivo)
            ?? throw new InvalidOperationException($"Script {nomeDoArquivo} não encontrado.");
        using var leitor = new StreamReader(fluxo);
        return leitor.ReadToEnd();
    }
}
