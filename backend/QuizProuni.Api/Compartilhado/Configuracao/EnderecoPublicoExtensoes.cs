namespace QuizProuni.Api.Compartilhado.Configuracao;

/// <summary>
/// Endereço público oficial do site (por exemplo https://prouni.feevale.br), usado no QR code da sala.
/// Em branco, o QR usa o endereço em que o moderador abriu o painel.
/// </summary>
public static class EnderecoPublicoExtensoes
{
    public const string Chave = "EnderecoPublico";

    /// <summary>
    /// Devolve o endereço no formato esquema://host[:porta], sem barra no fim, ou null quando não está configurado.
    /// Um valor preenchido e inválido lança exceção, para o site não subir com um QR code errado.
    /// </summary>
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
