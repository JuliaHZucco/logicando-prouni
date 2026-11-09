namespace QuizProuni.Api.Dados.Entidades;

public class RegistroDeLog
{
    public long LogId { get; set; }
    public DateTimeOffset DataHora { get; set; }
    public string Nivel { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public string? Excecao { get; set; }
    public string? RequestId { get; set; }
    public string? Metodo { get; set; }
    public string? Caminho { get; set; }
}
