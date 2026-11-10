namespace QuizProuni.Api.Compartilhado.Logs;

[ProviderAlias("Banco")]
public class LogNoBancoProvider : ILoggerProvider
{
    private readonly FilaDeLogs fila;
    private readonly IHttpContextAccessor acessoAoHttp;

    public LogNoBancoProvider(FilaDeLogs fila, IHttpContextAccessor acessoAoHttp)
    {
        this.fila = fila;
        this.acessoAoHttp = acessoAoHttp;
    }

    public ILogger CreateLogger(string categoria)
    {
        return new LogNoBancoLogger(categoria, fila, acessoAoHttp);
    }

    public void Dispose()
    {
    }
}
