namespace QuizProuni.Api.Dados.Entidades;

public class Resposta
{
    public int RespostaId { get; set; }
    public int SalaPerguntaId { get; set; }
    public short Rodada { get; set; }
    public int ParticipanteId { get; set; }
    public int AlternativaId { get; set; }
    public bool Correta { get; set; }
    public DateTimeOffset DataResposta { get; set; }
}
