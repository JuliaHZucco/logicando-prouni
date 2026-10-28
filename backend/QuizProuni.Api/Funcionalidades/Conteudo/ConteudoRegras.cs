using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados;

namespace QuizProuni.Api.Funcionalidades.Conteudo;

public static class ConteudoRegras
{
    public static async Task<ConteudoResponse> ObterConteudoAsync(QuizProuniContext db, ILogger logger)
    {
        try
        {
            var categorias = await db.Categorias.OrderBy(x => x.Ordem).ToListAsync();

            var duvidas = await db.Perguntas
                .Where(x => x.PerguntaBaseId == null && x.Ativa)
                .OrderBy(x => x.Ordem)
                .ToListAsync();

            return new ConteudoResponse
            {
                Categorias = categorias.Select(categoria => new CategoriaBag
                {
                    CategoriaId = categoria.CategoriaId,
                    CategoriaNome = categoria.Nome,
                    CategoriaDescricao = categoria.Descricao,
                    CategoriaIcone = categoria.Icone,
                    CategoriaDuvidas = duvidas
                        .Where(x => x.CategoriaId == categoria.CategoriaId)
                        .Select(x => new DuvidaBag
                        {
                            DuvidaId = x.PerguntaId,
                            DuvidaPergunta = x.Enunciado,
                            DuvidaResposta = x.Resposta ?? string.Empty
                        }).ToList()
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter o conteúdo do site.");
            return new ConteudoResponse { Erro = "Erro ao carregar o conteúdo." };
        }
    }
}
