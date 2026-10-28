namespace QuizProuni.Api.Compartilhado.Excecoes;

public class ConflitoException : Exception
{
    public string? Codigo { get; }

    public ConflitoException(string mensagem, string? codigo = null) : base(mensagem)
    {
        Codigo = codigo;
    }
}
