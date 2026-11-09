namespace QuizProuni.Api.Compartilhado.Logs;

[ProviderAlias("Banco")]
public class LogNoBancoProvider : ILoggerProvider
{
    private readonly FilaDeLogs fila;

    public LogNoBancoProvider(FilaDeLogs fila)
    {
        this.fila = fila;
    }

    public ILogger CreateLogger(string categoria)
    {
        return new LogNoBancoLogger(categoria, fila);
    }

    public void Dispose()
    {
    }
}
