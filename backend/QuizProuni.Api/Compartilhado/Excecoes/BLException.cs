namespace QuizProuni.Api.Compartilhado.Excecoes;

public class BLException : Exception
{
    public string? Codigo { get; }

    public BLException(string mensagem, string? codigo = null) : base(mensagem)
    {
        Codigo = codigo;
    }
}
