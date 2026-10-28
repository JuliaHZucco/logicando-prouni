namespace QuizProuni.Api.Dados.Entidades;

public class Participante
{
    public int ParticipanteId { get; set; }
    public int SalaId { get; set; }
    public int VisitanteId { get; set; }
    public string Apelido { get; set; } = string.Empty;
    public DateTimeOffset DataEntrada { get; set; }
    public DateTimeOffset DataUltimoAcesso { get; set; }
}
