namespace QuizProuni.Api.Compartilhado.Excecoes;

public class LimiteExcedidoException : Exception
{
    public const string MensagemPadrao = "Muitas requisições. Aguarde um pouco e tente novamente.";
    public const string Codigo = "LimiteExcedido";

    public LimiteExcedidoException() : base(MensagemPadrao)
    {
    }
}
