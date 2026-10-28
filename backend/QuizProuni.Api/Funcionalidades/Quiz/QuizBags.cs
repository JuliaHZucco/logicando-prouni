using QuizProuni.Api.Compartilhado;

namespace QuizProuni.Api.Funcionalidades.Quiz;

public class ConfiguracaoQuizRequest
{
    public string Modo { get; set; } = string.Empty;
    public List<string> Categorias { get; set; } = new();
    public int Quantidade { get; set; }
}

public class CriarPartidaRequest : ConfiguracaoQuizRequest
{
    public int? RepetirPartidaId { get; set; }
}

public class CriarPartidaResponse : RespostaBase
{
    public int PartidaId { get; set; }
    public List<PerguntaQuizBag> Perguntas { get; set; } = new();
}

public class PerguntaQuizBag
{
    public string DuvidaId { get; set; } = string.Empty;
    public string DuvidaPergunta { get; set; } = string.Empty;
    public string CategoriaId { get; set; } = string.Empty;
    public string CategoriaNome { get; set; } = string.Empty;
    public List<OpcaoRespostaBag> OpcoesResposta { get; set; } = new();
}

public class OpcaoRespostaBag
{
    public int AlternativaId { get; set; }
    public string Texto { get; set; } = string.Empty;
}

public class ResponderPerguntaRequest
{
    public string PerguntaId { get; set; } = string.Empty;
    public int AlternativaId { get; set; }
}

public class ResponderPerguntaResponse : RespostaBase
{
    public bool Correta { get; set; }
    public int AlternativaCorretaId { get; set; }
    public string Explicacao { get; set; } = string.Empty;
    public string BaseDuvidaId { get; set; } = string.Empty;
}

public class ItemDoResultadoBag
{
    public int Ordem { get; set; }
    public string DuvidaId { get; set; } = string.Empty;
    public string DuvidaPergunta { get; set; } = string.Empty;
    public string CategoriaId { get; set; } = string.Empty;
    public string BaseDuvidaId { get; set; } = string.Empty;
    public bool? Correta { get; set; }
}

public class ResultadoPartidaResponse : RespostaBase
{
    public int PartidaId { get; set; }
    public bool Finalizada { get; set; }
    public int TotalPerguntas { get; set; }
    public int Acertos { get; set; }
    public int PercentualAcerto { get; set; }
    public bool AproveitamentoPositivo { get; set; }
    public List<ItemDoResultadoBag> Itens { get; set; } = new();
}
