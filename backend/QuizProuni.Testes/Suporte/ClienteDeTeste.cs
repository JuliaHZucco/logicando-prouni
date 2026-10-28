

namespace QuizProuni.Testes.Suporte;

public class JarraDeCookies : DelegatingHandler
{
    private readonly Dictionary<string, string> cookies = new();

    public JarraDeCookies(HttpMessageHandler manipuladorInterno) : base(manipuladorInterno)
    {
    }

    public string CabecalhoCookie => string.Join("; ", cookies.Select(x => $"{x.Key}={x.Value}"));

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage requisicao, CancellationToken cancelamento)
    {
        if (cookies.Count > 0)
            requisicao.Headers.Add("Cookie", CabecalhoCookie);

        var resposta = await base.SendAsync(requisicao, cancelamento);

        if (resposta.Headers.TryGetValues("Set-Cookie", out var cabecalhos))
        {
            foreach (var cabecalho in cabecalhos)
            {
                var parNomeValor = cabecalho.Split(';')[0].Split('=', 2);
                if (parNomeValor.Length != 2)
                    continue;

                if (string.IsNullOrEmpty(parNomeValor[1]))
                    cookies.Remove(parNomeValor[0]);
                else
                    cookies[parNomeValor[0]] = parNomeValor[1];
            }
        }

        return resposta;
    }
}

public class ClienteDeTeste : HttpClient
{
    public JarraDeCookies Jarra { get; }

    public ClienteDeTeste(FabricaDaApi fabrica) : this(new JarraDeCookies(fabrica.Server.CreateHandler()))
    {
    }

    private ClienteDeTeste(JarraDeCookies jarra) : base(jarra)
    {
        Jarra = jarra;
        BaseAddress = new Uri("http://localhost");
    }
}
