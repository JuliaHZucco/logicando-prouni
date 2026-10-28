using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using QuizProuni.Api.Dados;

#nullable disable

namespace QuizProuni.Api.Dados.Migrations
{
    [DbContext(typeof(QuizProuniContext))]
    partial class QuizProuniContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "10.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Alternativa", b =>
                {
                    b.Property<int>("AlternativaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("alternativa_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("AlternativaId"));

                    b.Property<bool>("Correta")
                        .HasColumnType("boolean")
                        .HasColumnName("correta");

                    b.Property<string>("Letra")
                        .IsRequired()
                        .HasColumnType("character(1)")
                        .HasColumnName("letra");

                    b.Property<string>("PerguntaId")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("pergunta_id");

                    b.Property<string>("Texto")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("texto");

                    b.HasKey("AlternativaId")
                        .HasName("pk_alternativas");

                    b.HasAlternateKey("AlternativaId", "PerguntaId")
                        .HasName("ak_alternativas_alternativa_id_pergunta_id");

                    b.HasIndex("PerguntaId")
                        .IsUnique()
                        .HasDatabaseName("uq_alternativa_correta")
                        .HasFilter("correta");

                    b.HasIndex("PerguntaId", "Letra")
                        .IsUnique()
                        .HasDatabaseName("ix_alternativas_pergunta_id_letra");

                    b.ToTable("alternativas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Categoria", b =>
                {
                    b.Property<string>("CategoriaId")
                        .HasColumnType("text")
                        .HasColumnName("categoria_id");

                    b.Property<string>("Descricao")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("descricao");

                    b.Property<string>("Icone")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("icone");

                    b.Property<string>("Nome")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("nome");

                    b.Property<short>("Ordem")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((short)0)
                        .HasColumnName("ordem");

                    b.HasKey("CategoriaId")
                        .HasName("pk_categorias");

                    b.HasIndex("Nome")
                        .IsUnique()
                        .HasDatabaseName("ix_categorias_nome");

                    b.ToTable("categorias", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.DuvidaVista", b =>
                {
                    b.Property<int>("VisitanteId")
                        .HasColumnType("integer")
                        .HasColumnName("visitante_id");

                    b.Property<string>("PerguntaId")
                        .HasColumnType("text")
                        .HasColumnName("pergunta_id");

                    b.Property<DateTimeOffset>("DataVisualizacao")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_visualizacao")
                        .HasDefaultValueSql("now()");

                    b.HasKey("VisitanteId", "PerguntaId")
                        .HasName("pk_duvidas_vistas");

                    b.HasIndex("PerguntaId")
                        .HasDatabaseName("ix_duvidas_vistas_pergunta_id");

                    b.ToTable("duvidas_vistas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Exibicao", b =>
                {
                    b.Property<int>("SalaPerguntaId")
                        .HasColumnType("integer")
                        .HasColumnName("sala_pergunta_id");

                    b.Property<short>("Rodada")
                        .HasColumnType("smallint")
                        .HasColumnName("rodada");

                    b.Property<DateTimeOffset>("DataAbertura")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_abertura")
                        .HasDefaultValueSql("now()");

                    b.Property<DateTimeOffset?>("DataEncerramento")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_encerramento");

                    b.HasKey("SalaPerguntaId", "Rodada")
                        .HasName("pk_exibicoes");

                    b.ToTable("exibicoes", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Moderador", b =>
                {
                    b.Property<int>("ModeradorId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("moderador_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ModeradorId"));

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("email");

                    b.Property<string>("SenhaHash")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("senha_hash");

                    b.HasKey("ModeradorId")
                        .HasName("pk_moderadores");

                    b.HasIndex("Email")
                        .IsUnique()
                        .HasDatabaseName("ix_moderadores_email");

                    b.ToTable("moderadores", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Participante", b =>
                {
                    b.Property<int>("ParticipanteId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("participante_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ParticipanteId"));

                    b.Property<string>("Apelido")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("apelido");

                    b.Property<DateTimeOffset>("DataEntrada")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_entrada")
                        .HasDefaultValueSql("now()");

                    b.Property<DateTimeOffset>("DataUltimoAcesso")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_ultimo_acesso")
                        .HasDefaultValueSql("now()");

                    b.Property<int>("SalaId")
                        .HasColumnType("integer")
                        .HasColumnName("sala_id");

                    b.Property<int>("VisitanteId")
                        .HasColumnType("integer")
                        .HasColumnName("visitante_id");

                    b.HasKey("ParticipanteId")
                        .HasName("pk_participantes");

                    b.HasIndex("VisitanteId")
                        .HasDatabaseName("idx_participantes_visitante");

                    b.HasIndex("SalaId", "VisitanteId")
                        .IsUnique()
                        .HasDatabaseName("ix_participantes_sala_id_visitante_id");

                    b.ToTable("participantes", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.PartidaIndividual", b =>
                {
                    b.Property<int>("PartidaIndividualId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("partida_individual_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("PartidaIndividualId"));

                    b.Property<DateTimeOffset?>("DataFim")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_fim");

                    b.Property<DateTimeOffset>("DataInicio")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_inicio")
                        .HasDefaultValueSql("now()");

                    b.Property<string>("Modo")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("modo");

                    b.Property<int>("VisitanteId")
                        .HasColumnType("integer")
                        .HasColumnName("visitante_id");

                    b.HasKey("PartidaIndividualId")
                        .HasName("pk_partidas_individuais");

                    b.HasIndex("VisitanteId")
                        .HasDatabaseName("idx_partidas_visitante");

                    b.ToTable("partidas_individuais", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.PartidaPergunta", b =>
                {
                    b.Property<int>("PartidaIndividualId")
                        .HasColumnType("integer")
                        .HasColumnName("partida_individual_id");

                    b.Property<string>("PerguntaId")
                        .HasColumnType("text")
                        .HasColumnName("pergunta_id");

                    b.Property<short>("Ordem")
                        .HasColumnType("smallint")
                        .HasColumnName("ordem");

                    b.HasKey("PartidaIndividualId", "PerguntaId")
                        .HasName("pk_partida_perguntas");

                    b.HasIndex("PerguntaId")
                        .HasDatabaseName("ix_partida_perguntas_pergunta_id");

                    b.HasIndex("PartidaIndividualId", "Ordem")
                        .IsUnique()
                        .HasDatabaseName("ix_partida_perguntas_partida_individual_id_ordem");

                    b.ToTable("partida_perguntas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Pergunta", b =>
                {
                    b.Property<string>("PerguntaId")
                        .HasColumnType("text")
                        .HasColumnName("pergunta_id");

                    b.Property<bool>("Ativa")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(true)
                        .HasColumnName("ativa");

                    b.Property<string>("CategoriaId")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("categoria_id");

                    b.Property<string>("Enunciado")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("enunciado");

                    b.Property<short>("Ordem")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((short)0)
                        .HasColumnName("ordem");

                    b.Property<string>("PerguntaBaseId")
                        .HasColumnType("text")
                        .HasColumnName("pergunta_base_id");

                    b.Property<string>("Resposta")
                        .HasColumnType("text")
                        .HasColumnName("resposta");

                    b.HasKey("PerguntaId")
                        .HasName("pk_perguntas");

                    b.HasAlternateKey("PerguntaId", "CategoriaId")
                        .HasName("ak_perguntas_pergunta_id_categoria_id");

                    b.HasIndex("CategoriaId")
                        .HasDatabaseName("idx_perguntas_categoria");

                    b.HasIndex("PerguntaBaseId")
                        .HasDatabaseName("idx_perguntas_base");

                    b.HasIndex("PerguntaBaseId", "CategoriaId")
                        .HasDatabaseName("ix_perguntas_pergunta_base_id_categoria_id");

                    b.ToTable("perguntas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Resposta", b =>
                {
                    b.Property<int>("RespostaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("resposta_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("RespostaId"));

                    b.Property<int>("AlternativaId")
                        .HasColumnType("integer")
                        .HasColumnName("alternativa_id");

                    b.Property<bool>("Correta")
                        .HasColumnType("boolean")
                        .HasColumnName("correta");

                    b.Property<DateTimeOffset>("DataResposta")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_resposta")
                        .HasDefaultValueSql("now()");

                    b.Property<int>("ParticipanteId")
                        .HasColumnType("integer")
                        .HasColumnName("participante_id");

                    b.Property<short>("Rodada")
                        .HasColumnType("smallint")
                        .HasColumnName("rodada");

                    b.Property<int>("SalaPerguntaId")
                        .HasColumnType("integer")
                        .HasColumnName("sala_pergunta_id");

                    b.HasKey("RespostaId")
                        .HasName("pk_respostas");

                    b.HasIndex("ParticipanteId")
                        .HasDatabaseName("idx_respostas_participante");

                    b.HasIndex("SalaPerguntaId", "AlternativaId")
                        .HasDatabaseName("ix_respostas_sala_pergunta_id_alternativa_id");

                    b.HasIndex("SalaPerguntaId", "Rodada", "ParticipanteId")
                        .IsUnique()
                        .HasDatabaseName("ix_respostas_sala_pergunta_id_rodada_participante_id");

                    b.ToTable("respostas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.RespostaIndividual", b =>
                {
                    b.Property<int>("RespostaIndividualId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("resposta_individual_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("RespostaIndividualId"));

                    b.Property<int>("AlternativaId")
                        .HasColumnType("integer")
                        .HasColumnName("alternativa_id");

                    b.Property<bool>("Correta")
                        .HasColumnType("boolean")
                        .HasColumnName("correta");

                    b.Property<DateTimeOffset>("DataResposta")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_resposta")
                        .HasDefaultValueSql("now()");

                    b.Property<int>("PartidaIndividualId")
                        .HasColumnType("integer")
                        .HasColumnName("partida_individual_id");

                    b.Property<string>("PerguntaId")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("pergunta_id");

                    b.HasKey("RespostaIndividualId")
                        .HasName("pk_respostas_individuais");

                    b.HasIndex("PerguntaId")
                        .HasDatabaseName("idx_respostas_individuais_pergunta");

                    b.HasIndex("AlternativaId", "PerguntaId")
                        .HasDatabaseName("ix_respostas_individuais_alternativa_id_pergunta_id");

                    b.HasIndex("PartidaIndividualId", "PerguntaId")
                        .IsUnique()
                        .HasDatabaseName("ix_respostas_individuais_partida_individual_id_pergunta_id");

                    b.ToTable("respostas_individuais", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Sala", b =>
                {
                    b.Property<int>("SalaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("sala_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("SalaId"));

                    b.Property<string>("Codigo")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("codigo");

                    b.Property<DateTimeOffset>("DataCriacao")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_criacao")
                        .HasDefaultValueSql("now()");

                    b.Property<DateTimeOffset?>("DataEncerramento")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_encerramento");

                    b.Property<int>("ModeradorId")
                        .HasColumnType("integer")
                        .HasColumnName("moderador_id");

                    b.Property<string>("Modo")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("modo");

                    b.Property<string>("Nome")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("nome");

                    b.Property<short?>("PerguntaAtual")
                        .HasColumnType("smallint")
                        .HasColumnName("pergunta_atual");

                    b.Property<short>("QuantidadePerguntas")
                        .HasColumnType("smallint")
                        .HasColumnName("quantidade_perguntas");

                    b.Property<short>("RodadaAtual")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((short)1)
                        .HasColumnName("rodada_atual");

                    b.Property<short?>("SegundosPorPergunta")
                        .HasColumnType("smallint")
                        .HasColumnName("segundos_por_pergunta");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasColumnType("text")
                        .HasDefaultValue("aguardando")
                        .HasColumnName("status");

                    b.Property<bool>("UsaCronometro")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(false)
                        .HasColumnName("usa_cronometro");

                    b.HasKey("SalaId")
                        .HasName("pk_salas");

                    b.HasIndex("Codigo")
                        .IsUnique()
                        .HasDatabaseName("ix_salas_codigo");

                    b.HasIndex("ModeradorId", "DataCriacao")
                        .IsDescending(false, true)
                        .HasDatabaseName("idx_salas_moderador_data");

                    b.ToTable("salas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.SalaCategoria", b =>
                {
                    b.Property<int>("SalaId")
                        .HasColumnType("integer")
                        .HasColumnName("sala_id");

                    b.Property<string>("CategoriaId")
                        .HasColumnType("text")
                        .HasColumnName("categoria_id");

                    b.HasKey("SalaId", "CategoriaId")
                        .HasName("pk_sala_categorias");

                    b.HasIndex("CategoriaId")
                        .HasDatabaseName("ix_sala_categorias_categoria_id");

                    b.ToTable("sala_categorias", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.SalaPergunta", b =>
                {
                    b.Property<int>("SalaPerguntaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("sala_pergunta_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("SalaPerguntaId"));

                    b.Property<short>("Ordem")
                        .HasColumnType("smallint")
                        .HasColumnName("ordem");

                    b.Property<string>("PerguntaId")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("pergunta_id");

                    b.Property<int>("SalaId")
                        .HasColumnType("integer")
                        .HasColumnName("sala_id");

                    b.HasKey("SalaPerguntaId")
                        .HasName("pk_sala_perguntas");

                    b.HasIndex("PerguntaId")
                        .HasDatabaseName("ix_sala_perguntas_pergunta_id");

                    b.HasIndex("SalaId", "Ordem")
                        .IsUnique()
                        .HasDatabaseName("ix_sala_perguntas_sala_id_ordem");

                    b.HasIndex("SalaId", "PerguntaId")
                        .IsUnique()
                        .HasDatabaseName("ix_sala_perguntas_sala_id_pergunta_id");

                    b.ToTable("sala_perguntas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.SalaPerguntaAlternativa", b =>
                {
                    b.Property<int>("SalaPerguntaId")
                        .HasColumnType("integer")
                        .HasColumnName("sala_pergunta_id");

                    b.Property<int>("AlternativaId")
                        .HasColumnType("integer")
                        .HasColumnName("alternativa_id");

                    b.Property<short>("Posicao")
                        .HasColumnType("smallint")
                        .HasColumnName("posicao");

                    b.HasKey("SalaPerguntaId", "AlternativaId")
                        .HasName("pk_sala_pergunta_alternativas");

                    b.HasIndex("AlternativaId")
                        .HasDatabaseName("ix_sala_pergunta_alternativas_alternativa_id");

                    b.HasIndex("SalaPerguntaId", "Posicao")
                        .IsUnique()
                        .HasDatabaseName("ix_sala_pergunta_alternativas_sala_pergunta_id_posicao");

                    b.ToTable("sala_pergunta_alternativas", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Visitante", b =>
                {
                    b.Property<int>("VisitanteId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("visitante_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("VisitanteId"));

                    b.Property<DateTimeOffset>("DataCriacao")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_criacao")
                        .HasDefaultValueSql("now()");

                    b.Property<DateTimeOffset>("DataUltimoAcesso")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("data_ultimo_acesso")
                        .HasDefaultValueSql("now()");

                    b.Property<Guid>("Token")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("token")
                        .HasDefaultValueSql("gen_random_uuid()");

                    b.HasKey("VisitanteId")
                        .HasName("pk_visitantes");

                    b.HasIndex("Token")
                        .IsUnique()
                        .HasDatabaseName("ix_visitantes_token");

                    b.ToTable("visitantes", (string)null);
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Alternativa", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Pergunta", null)
                        .WithMany()
                        .HasForeignKey("PerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_alternativas_perguntas_pergunta_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.DuvidaVista", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Pergunta", null)
                        .WithMany()
                        .HasForeignKey("PerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_duvidas_vistas_perguntas_pergunta_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.Visitante", null)
                        .WithMany()
                        .HasForeignKey("VisitanteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_duvidas_vistas_visitantes_visitante_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Exibicao", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.SalaPergunta", null)
                        .WithMany()
                        .HasForeignKey("SalaPerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_exibicoes_sala_perguntas_sala_pergunta_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Participante", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Sala", null)
                        .WithMany()
                        .HasForeignKey("SalaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_participantes_salas_sala_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.Visitante", null)
                        .WithMany()
                        .HasForeignKey("VisitanteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_participantes_visitantes_visitante_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.PartidaIndividual", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Visitante", null)
                        .WithMany()
                        .HasForeignKey("VisitanteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_partidas_individuais_visitantes_visitante_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.PartidaPergunta", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.PartidaIndividual", null)
                        .WithMany()
                        .HasForeignKey("PartidaIndividualId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_partida_perguntas_partidas_individuais_partida_individual_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.Pergunta", null)
                        .WithMany()
                        .HasForeignKey("PerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_partida_perguntas_perguntas_pergunta_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Pergunta", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Categoria", null)
                        .WithMany()
                        .HasForeignKey("CategoriaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_perguntas_categorias_categoria_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.Pergunta", null)
                        .WithMany()
                        .HasForeignKey("PerguntaBaseId", "CategoriaId")
                        .HasPrincipalKey("PerguntaId", "CategoriaId")
                        .HasConstraintName("fk_perguntas_perguntas_pergunta_base_id_categoria_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Resposta", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Participante", null)
                        .WithMany()
                        .HasForeignKey("ParticipanteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_respostas_participantes_participante_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.SalaPerguntaAlternativa", null)
                        .WithMany()
                        .HasForeignKey("SalaPerguntaId", "AlternativaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_respostas_sala_pergunta_alternativas_sala_pergunta_id_alter");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.Exibicao", null)
                        .WithMany()
                        .HasForeignKey("SalaPerguntaId", "Rodada")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_respostas_exibicoes_sala_pergunta_id_rodada");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.RespostaIndividual", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Alternativa", null)
                        .WithMany()
                        .HasForeignKey("AlternativaId", "PerguntaId")
                        .HasPrincipalKey("AlternativaId", "PerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_respostas_individuais_alternativas_alternativa_id_pergunta_");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.PartidaPergunta", null)
                        .WithMany()
                        .HasForeignKey("PartidaIndividualId", "PerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_respostas_individuais_partida_perguntas_partida_individual_");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.Sala", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Moderador", null)
                        .WithMany()
                        .HasForeignKey("ModeradorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_salas_moderadores_moderador_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.SalaCategoria", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Categoria", null)
                        .WithMany()
                        .HasForeignKey("CategoriaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_sala_categorias_categorias_categoria_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.Sala", null)
                        .WithMany()
                        .HasForeignKey("SalaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_sala_categorias_salas_sala_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.SalaPergunta", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Pergunta", null)
                        .WithMany()
                        .HasForeignKey("PerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_sala_perguntas_perguntas_pergunta_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.Sala", null)
                        .WithMany()
                        .HasForeignKey("SalaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_sala_perguntas_salas_sala_id");
                });

            modelBuilder.Entity("QuizProuni.Api.Dados.Entidades.SalaPerguntaAlternativa", b =>
                {
                    b.HasOne("QuizProuni.Api.Dados.Entidades.Alternativa", null)
                        .WithMany()
                        .HasForeignKey("AlternativaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_sala_pergunta_alternativas_alternativas_alternativa_id");

                    b.HasOne("QuizProuni.Api.Dados.Entidades.SalaPergunta", null)
                        .WithMany()
                        .HasForeignKey("SalaPerguntaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_sala_pergunta_alternativas_sala_perguntas_sala_pergunta_id");
                });
#pragma warning restore 612, 618
        }
    }
}
