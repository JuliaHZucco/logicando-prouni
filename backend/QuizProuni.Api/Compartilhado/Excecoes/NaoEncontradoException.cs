namespace QuizProuni.Api.Compartilhado.Excecoes;

public class NaoEncontradoException : Exception
{
    public NaoEncontradoException(string mensagem) : base(mensagem)
    {
    }
}
