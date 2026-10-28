namespace QuizProuni.Api.Dados.Entidades;

public class Exibicao
{
    public int SalaPerguntaId { get; set; }
    public short Rodada { get; set; }
    public DateTimeOffset DataAbertura { get; set; }
    public DateTimeOffset? DataEncerramento { get; set; }
}
