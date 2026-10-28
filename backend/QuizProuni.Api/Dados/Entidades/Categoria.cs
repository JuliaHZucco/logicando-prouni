namespace QuizProuni.Api.Dados.Entidades;

public class Categoria
{
    public string CategoriaId { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Icone { get; set; } = string.Empty;
    public short Ordem { get; set; }
}
