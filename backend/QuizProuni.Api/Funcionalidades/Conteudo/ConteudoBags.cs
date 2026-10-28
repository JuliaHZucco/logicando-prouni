using QuizProuni.Api.Compartilhado;

namespace QuizProuni.Api.Funcionalidades.Conteudo;

public class ConteudoResponse : RespostaBase
{
    public List<CategoriaBag> Categorias { get; set; } = new();
}

public class CategoriaBag
{
    public string CategoriaId { get; set; } = string.Empty;
    public string CategoriaNome { get; set; } = string.Empty;
    public string CategoriaDescricao { get; set; } = string.Empty;
    public string CategoriaIcone { get; set; } = string.Empty;
    public List<DuvidaBag> CategoriaDuvidas { get; set; } = new();
}

public class DuvidaBag
{
    public string DuvidaId { get; set; } = string.Empty;
    public string DuvidaPergunta { get; set; } = string.Empty;
    public string DuvidaResposta { get; set; } = string.Empty;
}
