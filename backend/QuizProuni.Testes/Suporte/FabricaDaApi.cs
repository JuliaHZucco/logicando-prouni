using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using QuizProuni.Api.Dados;

namespace QuizProuni.Testes.Suporte;

public class FabricaDaApi : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Teste");
        builder.ConfigureAppConfiguration((_, configuracao) =>
        {
            var arquivoDoBancoDeTeste = Path.Combine(AppContext.BaseDirectory, "appsettings.Teste.json");
            configuracao.AddJsonFile(arquivoDoBancoDeTeste, optional: false);
        });
    }

    public void AplicarMigrations()
    {
        using var escopo = Services.CreateScope();
        escopo.ServiceProvider.GetRequiredService<QuizProuniContext>().Database.Migrate();
    }
}
