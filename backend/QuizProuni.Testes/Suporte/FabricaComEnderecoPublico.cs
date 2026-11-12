namespace QuizProuni.Testes.Suporte;

public class FabricaComEnderecoPublico : FabricaDaApi
{
    public const string Endereco = "https://prouni.exemplo.test/";

    protected override Dictionary<string, string?> LimitesDeUso()
    {
        var configuracao = base.LimitesDeUso();
        configuracao["EnderecoPublico"] = Endereco;
        return configuracao;
    }
}

public class FabricaComEnderecoPublicoInvalido : FabricaDaApi
{
    protected override Dictionary<string, string?> LimitesDeUso()
    {
        var configuracao = base.LimitesDeUso();
        configuracao["EnderecoPublico"] = "prouni.exemplo.test";
        return configuracao;
    }
}
