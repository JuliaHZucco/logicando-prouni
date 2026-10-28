using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Salas;

public static class CodigoDaSala
{
    private const string Alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int Tamanho = 6;

    public static async Task<string> GerarLivreAsync(QuizProuniContext db)
    {
        while (true)
        {
            var codigo = Gerar();
            var jaExiste = await db.Salas.AnyAsync(x => x.Codigo == codigo);
            if (!jaExiste)
                return codigo;
        }
    }

    private static string Gerar()
    {
        var caracteres = new char[Tamanho];
        for (var posicao = 0; posicao < Tamanho; posicao++)
            caracteres[posicao] = Alfabeto[RandomNumberGenerator.GetInt32(Alfabeto.Length)];

        return new string(caracteres);
    }
}
