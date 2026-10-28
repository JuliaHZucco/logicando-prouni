namespace QuizProuni.Api.Compartilhado.Excecoes;

public class AcessoNegadoException : Exception
{
    public AcessoNegadoException(string mensagem) : base(mensagem)
    {
    }
}
