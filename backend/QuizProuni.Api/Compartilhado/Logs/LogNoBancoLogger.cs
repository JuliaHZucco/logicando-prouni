using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Compartilhado.Logs;

public class LogNoBancoLogger : ILogger
{
    private static readonly string[] CategoriasIgnoradas =
    {
        "Microsoft.EntityFrameworkCore",
        "Npgsql",
        "QuizProuni.Api.Compartilhado.Logs"
    };

    private readonly string categoria;
    private readonly FilaDeLogs fila;
    private readonly IHttpContextAccessor acessoAoHttp;
    private readonly bool categoriaIgnorada;

    public LogNoBancoLogger(string categoria, FilaDeLogs fila, IHttpContextAccessor acessoAoHttp)
    {
        this.categoria = categoria;
        this.fila = fila;
        this.acessoAoHttp = acessoAoHttp;
        categoriaIgnorada = CategoriasIgnoradas.Any(prefixo => categoria.StartsWith(prefixo, StringComparison.Ordinal));
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return null;
    }

    public bool IsEnabled(LogLevel nivel)
    {
        return !categoriaIgnorada && nivel != LogLevel.None;
    }

    public void Log<TState>(LogLevel nivel, EventId evento, TState estado, Exception? excecao, Func<TState, Exception?, string> formatador)
    {
        if (!IsEnabled(nivel))
            return;

        var requisicao = acessoAoHttp.HttpContext;

        fila.Enfileirar(new RegistroDeLog
        {
            DataHora = DateTimeOffset.UtcNow,
            Nivel = nivel.ToString(),
            Categoria = Limitar(categoria, 300)!,
            Mensagem = Limitar(formatador(estado, excecao), null)!,
            Excecao = Limitar(excecao?.ToString(), null),
            RequestId = Limitar(Propriedade(estado, "RequestId") ?? requisicao?.TraceIdentifier, 100),
            Metodo = Limitar(Propriedade(estado, "Metodo") ?? requisicao?.Request.Method, 10),
            Caminho = Limitar(Propriedade(estado, "Caminho") ?? requisicao?.Request.Path.Value, 500)
        });
    }

    private static string? Propriedade<TState>(TState estado, string nome)
    {
        if (estado is not IEnumerable<KeyValuePair<string, object?>> propriedades)
            return null;

        foreach (var (chave, valor) in propriedades)
        {
            if (chave == nome)
                return valor?.ToString();
        }

        return null;
    }

    private static string? Limitar(string? texto, int? tamanhoMaximo)
    {
        if (texto == null)
            return null;

        texto = texto.Replace("\0", string.Empty);
        return tamanhoMaximo != null && texto.Length > tamanhoMaximo ? texto[..tamanhoMaximo.Value] : texto;
    }
}
