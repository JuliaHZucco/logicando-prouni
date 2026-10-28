using QuizProuni.Api.Compartilhado;
using QuizProuni.Api.Funcionalidades.Quiz;

namespace QuizProuni.Api.Funcionalidades.Salas;

public class CriarSalaRequest : ConfiguracaoQuizRequest
{
    public string Nome { get; set; } = string.Empty;
    public short? SegundosPorPergunta { get; set; }
}

public class CriarSalaResponse : RespostaBase
{
    public string Codigo { get; set; } = string.Empty;
}

public class SalaResumoBag
{
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Modo { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public List<string> Categorias { get; set; } = new();
    public DateTimeOffset CriadaEm { get; set; }
    public int Participantes { get; set; }
}

public class ListarMinhasSalasResponse : RespostaBase
{
    public List<SalaResumoBag> Salas { get; set; } = new();
}

public class ParticipanteBag
{
    public int Id { get; set; }
    public string Apelido { get; set; } = string.Empty;
}

public class EntrarNaSalaRequest
{
    public string Apelido { get; set; } = string.Empty;
}

public class EntrarNaSalaResponse : RespostaBase
{
    public ParticipanteBag Participante { get; set; } = new();
    public bool Reconectado { get; set; }
    public List<ParticipanteBag> Participantes { get; set; } = new();
}

public class AlternativaDaSalaBag
{
    public int AlternativaId { get; set; }
    public string Texto { get; set; } = string.Empty;
    public int Posicao { get; set; }
}

public class PerguntaDaSalaBag
{
    public int Ordem { get; set; }
    public int Total { get; set; }
    public string Enunciado { get; set; } = string.Empty;
    public List<AlternativaDaSalaBag> Alternativas { get; set; } = new();
    public int? SegundosRestantes { get; set; }
    public int Respondidas { get; set; }
}

public class BarraDoGraficoBag
{
    public int AlternativaId { get; set; }
    public int Posicao { get; set; }
    public string Texto { get; set; } = string.Empty;
    public int Respostas { get; set; }
    public double Percentual { get; set; }
}

public class ResultadoDaPerguntaBag
{
    public int TotalParticipantes { get; set; }
    public int TotalRespostas { get; set; }
    public int NaoResponderam { get; set; }
    public int Acertos { get; set; }
    public int Erros { get; set; }
    public int PercentualAcerto { get; set; }
    public int AlternativaCorretaId { get; set; }
    public string Explicacao { get; set; } = string.Empty;
    public List<BarraDoGraficoBag> Grafico { get; set; } = new();
}

public class LinhaDoRankingBag
{
    public int ParticipanteId { get; set; }
    public string Apelido { get; set; } = string.Empty;
    public int Acertos { get; set; }
    public int Posicao { get; set; }
    public int PerguntasExibidas { get; set; }
    public int? Aproveitamento { get; set; }
}

public class RankingResponse : RespostaBase
{
    public List<LinhaDoRankingBag> Ranking { get; set; } = new();
}

public class EstadoDaSalaBag
{
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Modo { get; set; } = string.Empty;
    public List<string> Categorias { get; set; } = new();
    public int QuantidadePerguntas { get; set; }
    public int? SegundosPorPergunta { get; set; }
    public int? PerguntaAtual { get; set; }
    public int Rodada { get; set; }
    public int TotalParticipantes { get; set; }
    public bool SouModerador { get; set; }
    public ParticipanteBag? Participante { get; set; }
    public List<ParticipanteBag> Participantes { get; set; } = new();
    public PerguntaDaSalaBag? Pergunta { get; set; }
    public int? MinhaAlternativaId { get; set; }
    public ResultadoDaPerguntaBag? Resultado { get; set; }
    public List<LinhaDoRankingBag>? Ranking { get; set; }
    public LinhaDoRankingBag? MinhaPosicao { get; set; }
}

public class EstadoDaSalaResponse : RespostaBase
{
    public EstadoDaSalaBag Estado { get; set; } = new();
}

public class AvancarResponse : RespostaBase
{
    public string Codigo { get; set; } = string.Empty;
    public bool IrParaRanking { get; set; }
    public short? SegundosPorPergunta { get; set; }
    public int SalaId { get; set; }
    public PerguntaDaSalaBag? Pergunta { get; set; }
    public List<LinhaDoRankingBag> Podio { get; set; } = new();
}

public class EncerrarPerguntaResponse : RespostaBase
{
    public string Codigo { get; set; } = string.Empty;
    public int Ordem { get; set; }
    public ResultadoDaPerguntaBag Resultado { get; set; } = new();
}

public class EncerrarSalaResponse : RespostaBase
{
    public string Codigo { get; set; } = string.Empty;
    public List<LinhaDoRankingBag> Podio { get; set; } = new();
}

public class JogarNovamenteResponse : RespostaBase
{
    public string Codigo { get; set; } = string.Empty;
    public int Rodada { get; set; }
}

public class RegistrarRespostaResponse : RespostaBase
{
    public int Respondidas { get; set; }
    public int TotalParticipantes { get; set; }
}
