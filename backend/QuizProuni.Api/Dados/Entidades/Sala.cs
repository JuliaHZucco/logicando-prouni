namespace QuizProuni.Api.Dados.Entidades;

public class Sala
{
    public int SalaId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public int ModeradorId { get; set; }
    public string Modo { get; set; } = string.Empty;
    public short QuantidadePerguntas { get; set; }
    public bool UsaCronometro { get; set; }
    public short? SegundosPorPergunta { get; set; }
    public string Status { get; set; } = "aguardando";
    public short? PerguntaAtual { get; set; }
    public short RodadaAtual { get; set; } = 1;
    public DateTimeOffset DataCriacao { get; set; }
    public DateTimeOffset? DataEncerramento { get; set; }
}
