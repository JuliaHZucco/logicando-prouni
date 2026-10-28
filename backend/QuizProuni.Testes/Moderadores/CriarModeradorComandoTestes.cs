using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Funcionalidades.Moderadores;
using QuizProuni.Testes.Suporte;

namespace QuizProuni.Testes.Moderadores;

public class CriarModeradorComandoTestes : TestesDeApi
{
    public CriarModeradorComandoTestes(FabricaDaApi fabrica) : base(fabrica)
    {
    }

    private static string NovoEmail() => $"Cmd-{Guid.NewGuid():N}@Teste.com";

    [Fact]
    public async Task Grava_o_email_em_minusculas_e_a_senha_com_bcrypt_e_o_moderador_consegue_entrar()
    {
        var email = NovoEmail();

        var (sucesso, _) = await UsarBancoAsync(db => CriarModeradorComando.ExecutarAsync(db, new[] { $"  {email}  ", "senha-segura-1" }));

        Assert.True(sucesso);
        var gravado = await UsarBancoAsync(db => db.Moderadores.SingleAsync(x => x.Email == email.ToLowerInvariant()));
        Assert.NotEqual("senha-segura-1", gravado.SenhaHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("senha-segura-1", gravado.SenhaHash));

        var resposta = await CriarVisitante().PostAsJsonAsync("/api/auth/login", new { email = email.ToUpperInvariant(), senha = "senha-segura-1" });
        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
    }

    [Fact]
    public async Task Recusa_email_repetido_sem_diferenciar_maiusculas()
    {
        var email = NovoEmail();
        await UsarBancoAsync(db => CriarModeradorComando.ExecutarAsync(db, new[] { email, "senha-segura-1" }));

        var (sucesso, mensagem) = await UsarBancoAsync(db => CriarModeradorComando.ExecutarAsync(db, new[] { email.ToUpperInvariant(), "outra-senha-2" }));

        Assert.False(sucesso);
        Assert.Contains("Já existe", mensagem);
    }

    [Theory]
    [InlineData("sem-arroba", "senha-segura-1")]
    [InlineData("pessoa@semponto", "senha-segura-1")]
    [InlineData("com espaco@teste.com", "senha-segura-1")]
    [InlineData("valido@teste.com", "curta")]
    public async Task Recusa_email_invalido_ou_senha_curta(string email, string senha)
    {
        var (sucesso, _) = await UsarBancoAsync(db => CriarModeradorComando.ExecutarAsync(db, new[] { email, senha }));

        Assert.False(sucesso);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(3)]
    public async Task Recusa_quantidade_errada_de_argumentos_e_mostra_o_uso(int quantidade)
    {
        var argumentos = Enumerable.Repeat("x", quantidade).ToArray();

        var (sucesso, mensagem) = await UsarBancoAsync(db => CriarModeradorComando.ExecutarAsync(db, argumentos));

        Assert.False(sucesso);
        Assert.Contains("Uso:", mensagem);
    }
}
