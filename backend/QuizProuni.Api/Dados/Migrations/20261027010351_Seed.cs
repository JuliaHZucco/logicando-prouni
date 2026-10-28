using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizProuni.Api.Dados.Migrations
{
    public partial class Seed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(ScriptSql.Ler("002-seed.sql"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM alternativas;");
            migrationBuilder.Sql("DELETE FROM perguntas WHERE pergunta_base_id IS NOT NULL;");
            migrationBuilder.Sql("DELETE FROM perguntas;");
            migrationBuilder.Sql("DELETE FROM categorias;");
        }
    }
}
