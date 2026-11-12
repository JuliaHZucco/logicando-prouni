using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Compartilhado.Logs;
using QuizProuni.Api.Compartilhado.Middlewares;
using QuizProuni.Api.Compartilhado.Seguranca;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Funcionalidades.Conteudo;
using QuizProuni.Api.Funcionalidades.DuvidasVistas;
using QuizProuni.Api.Funcionalidades.Moderadores;
using QuizProuni.Api.Funcionalidades.Quiz;
using QuizProuni.Api.Funcionalidades.Salas;
using QuizProuni.Api.Funcionalidades.Salas.TempoReal;
using QuizProuni.Api.Funcionalidades.Visitantes;

const int TamanhoMaximoDoCorpoEmBytes = 64 * 1024;
const string PastaDeArquivosComHash = "/assets/";

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(opcoes => opcoes.Limits.MaxRequestBodySize = TamanhoMaximoDoCorpoEmBytes);

builder.Services.AddControllers();
builder.Services.AddResponseCompression(opcoes =>
{
    opcoes.EnableForHttps = true;
    opcoes.Providers.Add<BrotliCompressionProvider>();
    opcoes.Providers.Add<GzipCompressionProvider>();
});
builder.Services.AddSignalR();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<QuizProuniContext>(opcoes =>
    opcoes.UseNpgsql(builder.Configuration.GetConnectionString("QuizProuni")).UseSnakeCaseNamingConvention());

builder.Services.AddLimitesDeUso(builder.Configuration);

builder.Services.AddSingleton<FilaDeLogs>();
builder.Services.AddSingleton<ILoggerProvider, LogNoBancoProvider>();
builder.Services.AddHostedService<GravadorDeLogs>();

builder.Services.AddSingleton<TokenModerador>();
builder.Services.AddSingleton<NotificadorDaSala>();
builder.Services.AddHostedService<EncerradorDePerguntasVencidas>();
builder.Services.AddScoped<VisitanteContexto>();
builder.Services.AddScoped<ModeradorContexto>();
builder.Services.AddTransient<AuthService>();
builder.Services.AddTransient<ConteudoService>();
builder.Services.AddTransient<DuvidasVistasService>();
builder.Services.AddTransient<QuizService>();
builder.Services.AddTransient<SalaService>();
builder.Services.AddTransient<SalaAoVivoService>();

var app = builder.Build();

if (args.Length > 0 && args[0] == CriarModeradorComando.Nome)
{
    using var escopo = app.Services.CreateScope();
    var db = escopo.ServiceProvider.GetRequiredService<QuizProuniContext>();
    var (sucesso, mensagem) = await CriarModeradorComando.ExecutarAsync(db, args[1..]);
    Console.WriteLine(mensagem);
    return sucesso ? 0 : 1;
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseResponseCompression();

var opcoesDeArquivosEstaticos = new StaticFileOptions { OnPrepareResponse = DefinirCacheDoArquivoEstatico };

app.UseDefaultFiles();
app.UseStaticFiles(opcoesDeArquivosEstaticos);
app.UseRouting();
app.UseRateLimiter();

app.MapControllers();
app.MapHub<SalaHub>("/hubs/sala");
app.MapFallbackToFile("/{*caminho:regex(^(?!api/|hubs/).*$)}", "index.html", opcoesDeArquivosEstaticos);

app.Run();
return 0;

static void DefinirCacheDoArquivoEstatico(StaticFileResponseContext contexto)
{
    var cabecalhos = contexto.Context.Response.Headers;
    var caminho = contexto.Context.Request.Path.Value ?? string.Empty;

    if (caminho.StartsWith(PastaDeArquivosComHash, StringComparison.OrdinalIgnoreCase))
        cabecalhos.CacheControl = "public,max-age=31536000,immutable";
    else if (contexto.File.Name.Equals("index.html", StringComparison.OrdinalIgnoreCase))
        cabecalhos.CacheControl = "no-cache";
    else
        cabecalhos.CacheControl = "public,max-age=86400";
}

public partial class Program
{
}
