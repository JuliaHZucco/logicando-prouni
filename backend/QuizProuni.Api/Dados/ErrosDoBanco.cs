using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace QuizProuni.Api.Dados;

public static class ErrosDoBanco
{
    private const string ViolacaoDeRestricaoUnica = "23505";

    public static bool ViolouRestricaoUnica(DbUpdateException excecao, string? nomeDaRestricao = null)
    {
        if (excecao.InnerException is not PostgresException erroDoPostgres)
            return false;

        if (erroDoPostgres.SqlState != ViolacaoDeRestricaoUnica)
            return false;

        return nomeDaRestricao == null || erroDoPostgres.ConstraintName == nomeDaRestricao;
    }
}
