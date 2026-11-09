using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Funcionalidades.Salas.TempoReal;

namespace QuizProuni.Testes.Suporte;

public class FabricaDaApi : WebApplicationFactory<Program>
{
    private const int SemLimite = 1_000_000;

    protected virtual bool EncerradorDePerguntasVencidasAtivo => false;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Teste");
        builder.ConfigureAppConfiguration((_, configuracao) =>
        {
            var arquivoDoBancoDeTeste = Path.Combine(AppContext.BaseDirectory, "appsettings.Teste.json");
            configuracao.AddJsonFile(arquivoDoBancoDeTeste, optional: false);
            configuracao.AddInMemoryCollection(LimitesDeUso());
        });
        builder.ConfigureServices(servicos =>
        {
            if (EncerradorDePerguntasVencidasAtivo)
                return;

            var encerrador = servicos.Single(x => x.ServiceType == typeof(IHostedService) && x.ImplementationType == typeof(EncerradorDePerguntasVencidas));
            servicos.Remove(encerrador);
        });
    }

    public void AplicarMigrations()
    {
        using var escopo = Services.CreateScope();
        escopo.ServiceProvider.GetRequiredService<QuizProuniContext>().Database.Migrate();
    }

    protected virtual Dictionary<string, string?> LimitesDeUso()
    {
        return new Dictionary<string, string?>
        {
            ["Seguranca:Limites:LoginsPorMinuto"] = SemLimite.ToString(),
            ["Seguranca:Limites:AcessosASalaPorMinuto"] = SemLimite.ToString(),
            ["Seguranca:Limites:NovosVisitantesPorHora"] = SemLimite.ToString()
        };
    }
}
