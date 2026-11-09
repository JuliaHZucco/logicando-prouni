using System.Linq.Expressions;
using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados.Entidades;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Logs;

public class LogsTestes : TestesDeApi
{
    public LogsTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Erro_de_negocio_e_gravado_na_tabela_de_logs()
    {
        var inicio = DateTimeOffset.UtcNow;
        var cliente = CriarVisitante();

        var resposta = await cliente.PostAsJsonAsync("/api/quiz/partidas", new { modo = "invalido", categorias = Array.Empty<string>(), quantidade = 3 });
        var log = await AguardarLogAsync(x => x.DataHora >= inicio && x.Caminho == "/api/quiz/partidas" && x.Mensagem.Contains("Modo inválido"));

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        Assert.NotNull(log);
        Assert.Equal("Warning", log.Nivel);
        Assert.Equal("POST", log.Metodo);
        Assert.False(string.IsNullOrEmpty(log.RequestId));
        Assert.Contains("ExceptionMiddleware", log.Categoria);
    }

    private async Task<RegistroDeLog?> AguardarLogAsync(Expression<Func<RegistroDeLog, bool>> condicao)
    {
        var limite = DateTime.UtcNow.AddSeconds(10);
        while (DateTime.UtcNow < limite)
        {
            var log = await UsarBancoAsync(db => db.Logs.Where(condicao).OrderByDescending(x => x.LogId).FirstOrDefaultAsync());
            if (log != null)
                return log;

            await Task.Delay(100);
        }

        return null;
    }
}
