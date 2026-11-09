namespace QuizProuni.Api.Compartilhado.Seguranca;

public static class OrigemDaRequisicao
{
    private const string Desconhecida = "desconhecido";

    public static string Ip(HttpContext contexto)
    {
        var endereco = contexto.Connection.RemoteIpAddress;
        if (endereco == null)
            return Desconhecida;

        return (endereco.IsIPv4MappedToIPv6 ? endereco.MapToIPv4() : endereco).ToString();
    }
}
