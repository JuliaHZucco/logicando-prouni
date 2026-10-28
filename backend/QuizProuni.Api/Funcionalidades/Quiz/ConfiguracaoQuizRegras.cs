using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Quiz;

public static class ConfiguracaoQuizRegras
{
    public const string ModoAleatorio = "aleatorio";
    public const string ModoCategoria = "categoria";
    public const string ModoMisto = "misto";
    public const int QuantidadeMinima = 1;
    public const int QuantidadeMaxima = 10;

    public static string? Validar(ConfiguracaoQuizRequest configuracao)
    {
        var categorias = configuracao.Categorias.Distinct().ToList();

        if (configuracao.Modo != ModoAleatorio && configuracao.Modo != ModoCategoria && configuracao.Modo != ModoMisto)
            return "Modo inválido.";

        if (configuracao.Quantidade < QuantidadeMinima || configuracao.Quantidade > QuantidadeMaxima)
            return "A quantidade deve ser de 1 a 10 perguntas.";

        if (configuracao.Modo == ModoAleatorio && categorias.Count > 0)
            return "O modo aleatório não usa categorias.";

        if (configuracao.Modo == ModoCategoria && categorias.Count != 1)
            return "Escolha exatamente uma categoria.";

        if (configuracao.Modo == ModoMisto && categorias.Count < 1)
            return "Escolha pelo menos uma categoria.";

        if (configuracao.Modo == ModoMisto && configuracao.Quantidade < categorias.Count)
            return $"No modo misto, o mínimo é uma pergunta por categoria escolhida ({categorias.Count}).";

        return null;
    }

    public static async Task<(List<string> PerguntasIds, string? Erro)> SortearPerguntasAsync(QuizProuniContext db, ConfiguracaoQuizRequest configuracao)
    {
        var categoriasEscolhidas = configuracao.Categorias.Distinct().ToList();

        if (categoriasEscolhidas.Count > 0)
        {
            var categoriasEncontradas = await db.Categorias.CountAsync(x => categoriasEscolhidas.Contains(x.CategoriaId));
            if (categoriasEncontradas != categoriasEscolhidas.Count)
                return (new List<string>(), "Categoria inválida.");
        }

        var candidatas = await db.Perguntas
            .Where(x => x.Ativa)
            .Where(x => db.Alternativas.Any(a => a.PerguntaId == x.PerguntaId))
            .Where(x => configuracao.Modo == ModoAleatorio || categoriasEscolhidas.Contains(x.CategoriaId))
            .Select(x => new { x.PerguntaId, x.CategoriaId })
            .ToListAsync();

        if (candidatas.Count < configuracao.Quantidade)
            return (new List<string>(), "Não há perguntas suficientes para essa configuração.");

        var embaralhadas = candidatas.ToArray();
        Random.Shared.Shuffle(embaralhadas);

        var escolhidas = new List<string>();

        if (configuracao.Modo == ModoMisto)
        {
            var umaPorCategoria = embaralhadas.GroupBy(x => x.CategoriaId).Select(grupo => grupo.First());
            escolhidas.AddRange(umaPorCategoria.Select(x => x.PerguntaId));
        }

        var restantes = embaralhadas.Select(x => x.PerguntaId).Where(id => !escolhidas.Contains(id));
        escolhidas.AddRange(restantes.Take(configuracao.Quantidade - escolhidas.Count));

        var ordemFinal = escolhidas.ToArray();
        Random.Shared.Shuffle(ordemFinal);
        return (ordemFinal.ToList(), null);
    }
}
