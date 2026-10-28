namespace QuizProuni.Api.Compartilhado.Excecoes;

public class NaoAutorizadoException : Exception
{
    public NaoAutorizadoException(string mensagem) : base(mensagem)
    {
    }
}
