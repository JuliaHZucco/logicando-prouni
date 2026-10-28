using QuizProuni.Api.Compartilhado;

namespace QuizProuni.Api.Funcionalidades.DuvidasVistas;

public class RegistrarDuvidaVistaRequest
{
    public string DuvidaId { get; set; } = string.Empty;
}

public class ListarDuvidasVistasResponse : RespostaBase
{
    public List<string> DuvidasIds { get; set; } = new();
}
