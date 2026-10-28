using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Compartilhado.Middlewares;
using QuizProuni.Api.Dados;
using QuizProuni.Api.Funcionalidades.Conteudo;
using QuizProuni.Api.Funcionalidades.DuvidasVistas;
using QuizProuni.Api.Funcionalidades.Moderadores;
using QuizProuni.Api.Funcionalidades.Quiz;
using QuizProuni.Api.Funcionalidades.Salas;
using QuizProuni.Api.Funcionalidades.Salas.TempoReal;
using QuizProuni.Api.Funcionalidades.Visitantes;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<QuizProuniContext>(opcoes =>
    opcoes.UseNpgsql(builder.Configuration.GetConnectionString("QuizProuni")).UseSnakeCaseNamingConvention());

builder.Services.AddSingleton<TokenModerador>();
builder.Services.AddSingleton<NotificadorDaSala>();
builder.Services.AddSingleton<CronometroDasSalas>();
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

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

app.MapControllers();
app.MapHub<SalaHub>("/hubs/sala");
app.MapFallbackToFile("/{*caminho:regex(^(?!api/|hubs/).*$)}", "index.html");

app.Run();
return 0;

public partial class Program
{
}
