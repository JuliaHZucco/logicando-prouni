using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizProuni.Api.Dados.Migrations
{
    public partial class Inicial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(ScriptSql.Ler("001-criacao.sql"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var tabelasDaUltimaParaAPrimeira = new[]
            {
                "respostas", "participantes", "sala_pergunta_alternativas", "exibicoes", "sala_perguntas",
                "sala_categorias", "salas", "respostas_individuais", "partida_perguntas", "partidas_individuais",
                "duvidas_vistas", "visitantes", "alternativas", "perguntas", "categorias", "moderadores"
            };

            foreach (var tabela in tabelasDaUltimaParaAPrimeira)
                migrationBuilder.DropTable(name: tabela);
        }
    }
}
