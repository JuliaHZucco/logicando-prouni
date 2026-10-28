using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuizProuni.Api.Dados;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Banco;

public class SeedTestes : IClassFixture<FabricaDaApi>
{
    private readonly FabricaDaApi fabrica;

    public SeedTestes(FabricaDaApi fabrica)
    {
        this.fabrica = fabrica;
        fabrica.AplicarMigrations();
    }

    private QuizProuniContext AbrirContexto()
    {
        return fabrica.Services.CreateScope().ServiceProvider.GetRequiredService<QuizProuniContext>();
    }

    [Fact]
    public async Task Seed_cria_8_categorias_e_87_perguntas_sendo_71_originais_e_16_derivadas()
    {
        var contexto = AbrirContexto();

        Assert.Equal(8, await contexto.Categorias.CountAsync());
        Assert.Equal(87, await contexto.Perguntas.CountAsync());
        Assert.Equal(71, await contexto.Perguntas.CountAsync(x => x.PerguntaBaseId == null && x.Resposta != null));
        Assert.Equal(16, await contexto.Perguntas.CountAsync(x => x.PerguntaBaseId != null && x.Resposta == null));
    }

    [Fact]
    public async Task Toda_pergunta_tem_4_alternativas_e_exatamente_uma_correta()
    {
        var contexto = AbrirContexto();

        var alternativasPorPergunta = await contexto.Alternativas
            .GroupBy(x => x.PerguntaId)
            .Select(grupo => new { Total = grupo.Count(), Corretas = grupo.Count(x => x.Correta) })
            .ToListAsync();

        Assert.Equal(87, alternativasPorPergunta.Count);
        Assert.All(alternativasPorPergunta, x =>
        {
            Assert.Equal(4, x.Total);
            Assert.Equal(1, x.Corretas);
        });
    }

    [Fact]
    public async Task Toda_pergunta_derivada_aponta_para_uma_base_da_mesma_categoria()
    {
        var contexto = AbrirContexto();

        var derivadasSemBaseNaMesmaCategoria = await contexto.Perguntas
            .Where(derivada => derivada.PerguntaBaseId != null)
            .Where(derivada => !contexto.Perguntas.Any(base_ =>
                base_.PerguntaId == derivada.PerguntaBaseId && base_.CategoriaId == derivada.CategoriaId))
            .CountAsync();

        Assert.Equal(0, derivadasSemBaseNaMesmaCategoria);
    }

    [Fact]
    public async Task Categorias_seguem_a_ordem_do_conteudo_original()
    {
        var contexto = AbrirContexto();

        var ordens = await contexto.Categorias.OrderBy(x => x.Ordem).Select(x => (int)x.Ordem).ToListAsync();

        Assert.Equal(Enumerable.Range(1, 8), ordens);
    }

    [Fact]
    public async Task Banco_recusa_alternativa_com_letra_fora_de_a_a_d()
    {
        var contexto = AbrirContexto();
        var perguntaId = await contexto.Perguntas.Select(x => x.PerguntaId).FirstAsync();

        var excecao = await Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            contexto.Alternativas.Add(new QuizProuni.Api.Dados.Entidades.Alternativa
            {
                PerguntaId = perguntaId,
                Letra = "e",
                Texto = "Alternativa extra",
                Correta = true
            });
            await contexto.SaveChangesAsync();
        });

        Assert.NotNull(excecao.InnerException);
    }
}
