namespace QuizProuni.Api.Compartilhado.Configuracao;

public static class EnderecoPublicoExtensoes
{
    public const string Chave = "EnderecoPublico";

    public static string? LerEnderecoPublico(this IConfiguration configuracao)
    {
        var texto = configuracao[Chave]?.Trim();
        if (string.IsNullOrEmpty(texto))
            return null;

        var valido = Uri.TryCreate(texto, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
            && !string.IsNullOrEmpty(uri.Host)
            && uri.AbsolutePath == "/"
            && string.IsNullOrEmpty(uri.Query)
            && string.IsNullOrEmpty(uri.Fragment)
            && string.IsNullOrEmpty(uri.UserInfo);

        if (!valido)
            throw new InvalidOperationException($"{Chave} inválido: \"{texto}\". Use o endereço completo do site, sem caminho, como https://prouni.feevale.br.");

        return uri!.GetLeftPart(UriPartial.Authority);
    }
}
