using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuizProuni.Api.Funcionalidades.Salas;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Salas;

public class EncerramentoPorPrazoTestes : TestesDeApi, IClassFixture<FabricaComEncerradorDePerguntas>
{
    public EncerramentoPorPrazoTestes(FabricaComEncerradorDePerguntas fabrica) : base(fabrica)
    {
    }

    [Fact]
    public async Task Cronometro_encerra_a_pergunta_sozinho_quando_o_tempo_acaba()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync(quantidade: 1, segundos: 10);
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        var encerrada = AguardarEventoAsync(ana, "resultado-disponivel", segundosDeEspera: 20);

        await InvocarAsync(moderador, "Avancar", codigo);
        var resultado = await encerrada;

        Assert.Equal(1, resultado.GetProperty("naoResponderam").GetInt32());
        Assert.Equal(0, resultado.GetProperty("totalRespostas").GetInt32());
    }

    [Fact]
    public async Task Pergunta_com_prazo_vencido_e_encerrada_pela_varredura_sem_depender_de_cronometro_em_memoria()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync(quantidade: 1, segundos: 10);
        var (_, ana) = await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);
        var encerrada = AguardarEventoAsync(ana, "resultado-disponivel", segundosDeEspera: 5);

        await EnvelhecerPerguntaAsync(codigo, segundosDesdeAAbertura: 30);

        var resultado = await encerrada;
        Assert.Equal(1, resultado.GetProperty("naoResponderam").GetInt32());
    }

    [Fact]
    public async Task Encerramento_por_prazo_nao_fecha_pergunta_que_ainda_esta_dentro_do_prazo()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync(quantidade: 1, segundos: 60);
        await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);

        using var escopo = fabrica.Services.CreateScope();
        var resposta = await escopo.ServiceProvider.GetRequiredService<SalaAoVivoService>().EncerrarPerguntaVencidaAsync(codigo);

        Assert.True(resposta.TemErro);
        Assert.Equal("PerguntaEmAndamento", resposta.CodigoErro);
        Assert.Equal("pergunta_aberta", await ObterStatusDaSalaAsync(codigo));
    }

    [Fact]
    public async Task Varredura_nao_encerra_pergunta_de_sala_sem_cronometro()
    {
        var (_, moderador, codigo) = await PrepararSalaAsync(quantidade: 1);
        await EntrarComoParticipanteAsync(codigo, "Ana");
        await InvocarAsync(moderador, "Avancar", codigo);
        await EnvelhecerPerguntaAsync(codigo, segundosDesdeAAbertura: 3600);

        await Task.Delay(TimeSpan.FromSeconds(2));

        Assert.Equal("pergunta_aberta", await ObterStatusDaSalaAsync(codigo));
    }

    private Task<string> ObterStatusDaSalaAsync(string codigo)
    {
        return UsarBancoAsync(db => db.Salas.Where(x => x.Codigo == codigo).Select(x => x.Status).SingleAsync());
    }

    private async Task EnvelhecerPerguntaAsync(string codigo, int segundosDesdeAAbertura)
    {
        await UsarBancoAsync(async db =>
        {
            var exibicao = await (
                from candidata in db.Exibicoes
                join salaPergunta in db.SalaPerguntas on candidata.SalaPerguntaId equals salaPergunta.SalaPerguntaId
                join sala in db.Salas on salaPergunta.SalaId equals sala.SalaId
                where sala.Codigo == codigo
                select candidata
            ).SingleAsync();
            exibicao.DataAbertura = DateTimeOffset.UtcNow.AddSeconds(-segundosDesdeAAbertura);
            await db.SaveChangesAsync();
            return 0;
        });
    }
}
