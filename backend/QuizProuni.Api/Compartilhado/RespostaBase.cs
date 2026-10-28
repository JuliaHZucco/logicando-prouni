using QuizProuni.Api.Compartilhado.Excecoes;

namespace QuizProuni.Api.Compartilhado;

public enum TipoDeErro
{
    Negocio,
    NaoEncontrado,
    Conflito,
    NaoAutorizado,
    AcessoNegado
}

public class RespostaBase
{
    public string? Erro { get; set; }
    public string? CodigoErro { get; set; }
    public TipoDeErro TipoErro { get; set; }

    public bool TemErro => !string.IsNullOrEmpty(Erro);

    public void LancarSeHouverErro()
    {
        if (!TemErro)
            return;

        switch (TipoErro)
        {
            case TipoDeErro.NaoEncontrado:
                throw new NaoEncontradoException(Erro!);
            case TipoDeErro.Conflito:
                throw new ConflitoException(Erro!, CodigoErro);
            case TipoDeErro.NaoAutorizado:
                throw new NaoAutorizadoException(Erro!);
            case TipoDeErro.AcessoNegado:
                throw new AcessoNegadoException(Erro!);
            default:
                throw new BLException(Erro!, CodigoErro);
        }
    }

    public static T ComErro<T>(string mensagem, TipoDeErro tipo = TipoDeErro.Negocio, string? codigo = null) where T : RespostaBase, new()
    {
        return new T { Erro = mensagem, TipoErro = tipo, CodigoErro = codigo };
    }
}
