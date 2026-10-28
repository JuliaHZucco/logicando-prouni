using Microsoft.EntityFrameworkCore;
using QuizProuni.Api.Dados.Entidades;

namespace QuizProuni.Api.Dados;

public class QuizProuniContext : DbContext
{
    public QuizProuniContext(DbContextOptions<QuizProuniContext> options) : base(options)
    {
    }

    public DbSet<Moderador> Moderadores => Set<Moderador>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Pergunta> Perguntas => Set<Pergunta>();
    public DbSet<Alternativa> Alternativas => Set<Alternativa>();
    public DbSet<Visitante> Visitantes => Set<Visitante>();
    public DbSet<DuvidaVista> DuvidasVistas => Set<DuvidaVista>();
    public DbSet<PartidaIndividual> PartidasIndividuais => Set<PartidaIndividual>();
    public DbSet<PartidaPergunta> PartidaPerguntas => Set<PartidaPergunta>();
    public DbSet<RespostaIndividual> RespostasIndividuais => Set<RespostaIndividual>();
    public DbSet<Sala> Salas => Set<Sala>();
    public DbSet<SalaCategoria> SalaCategorias => Set<SalaCategoria>();
    public DbSet<SalaPergunta> SalaPerguntas => Set<SalaPergunta>();
    public DbSet<Exibicao> Exibicoes => Set<Exibicao>();
    public DbSet<SalaPerguntaAlternativa> SalaPerguntaAlternativas => Set<SalaPerguntaAlternativa>();
    public DbSet<Participante> Participantes => Set<Participante>();
    public DbSet<Resposta> Respostas => Set<Resposta>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        MapearModeradores(modelBuilder);
        MapearConteudo(modelBuilder);
        MapearVisitantes(modelBuilder);
        MapearPartidasIndividuais(modelBuilder);
        MapearSalas(modelBuilder);
        MapearRespostasDasSalas(modelBuilder);
    }

    private static void MapearModeradores(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Moderador>(moderador =>
        {
            moderador.ToTable("moderadores");
            moderador.HasKey(x => x.ModeradorId);
            moderador.HasIndex(x => x.Email).IsUnique();
        });
    }

    private static void MapearConteudo(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Categoria>(categoria =>
        {
            categoria.ToTable("categorias");
            categoria.HasKey(x => x.CategoriaId);
            categoria.HasIndex(x => x.Nome).IsUnique();
            categoria.Property(x => x.Ordem).HasDefaultValue((short)0);
        });

        modelBuilder.Entity<Pergunta>(pergunta =>
        {
            pergunta.ToTable("perguntas");
            pergunta.HasKey(x => x.PerguntaId);
            pergunta.HasAlternateKey(x => new { x.PerguntaId, x.CategoriaId });
            pergunta.Property(x => x.Ordem).HasDefaultValue((short)0);
            pergunta.Property(x => x.Ativa).HasDefaultValue(true);
            pergunta.HasIndex(x => x.CategoriaId).HasDatabaseName("idx_perguntas_categoria");
            pergunta.HasIndex(x => x.PerguntaBaseId).HasDatabaseName("idx_perguntas_base");
            pergunta.HasOne<Categoria>().WithMany().HasForeignKey(x => x.CategoriaId);
            pergunta.HasOne<Pergunta>().WithMany()
                .HasForeignKey(x => new { x.PerguntaBaseId, x.CategoriaId })
                .HasPrincipalKey(x => new { x.PerguntaId, x.CategoriaId });
        });

        modelBuilder.Entity<Alternativa>(alternativa =>
        {
            alternativa.ToTable("alternativas");
            alternativa.HasKey(x => x.AlternativaId);
            alternativa.HasAlternateKey(x => new { x.AlternativaId, x.PerguntaId });
            alternativa.HasIndex(x => new { x.PerguntaId, x.Letra }).IsUnique();
            alternativa.HasIndex(x => x.PerguntaId).IsUnique().HasFilter("correta").HasDatabaseName("uq_alternativa_correta");
            alternativa.Property(x => x.Letra).HasColumnType("character(1)");
            alternativa.HasOne<Pergunta>().WithMany().HasForeignKey(x => x.PerguntaId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void MapearVisitantes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Visitante>(visitante =>
        {
            visitante.ToTable("visitantes");
            visitante.HasKey(x => x.VisitanteId);
            visitante.HasIndex(x => x.Token).IsUnique();
            visitante.Property(x => x.Token).HasDefaultValueSql("gen_random_uuid()");
            visitante.Property(x => x.DataCriacao).HasDefaultValueSql("now()");
            visitante.Property(x => x.DataUltimoAcesso).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<DuvidaVista>(duvidaVista =>
        {
            duvidaVista.ToTable("duvidas_vistas");
            duvidaVista.HasKey(x => new { x.VisitanteId, x.PerguntaId });
            duvidaVista.Property(x => x.DataVisualizacao).HasDefaultValueSql("now()");
            duvidaVista.HasOne<Visitante>().WithMany().HasForeignKey(x => x.VisitanteId).OnDelete(DeleteBehavior.Cascade);
            duvidaVista.HasOne<Pergunta>().WithMany().HasForeignKey(x => x.PerguntaId);
        });
    }

    private static void MapearPartidasIndividuais(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PartidaIndividual>(partida =>
        {
            partida.ToTable("partidas_individuais");
            partida.HasKey(x => x.PartidaIndividualId);
            partida.Property(x => x.DataInicio).HasDefaultValueSql("now()");
            partida.HasIndex(x => x.VisitanteId).HasDatabaseName("idx_partidas_visitante");
            partida.HasOne<Visitante>().WithMany().HasForeignKey(x => x.VisitanteId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PartidaPergunta>(partidaPergunta =>
        {
            partidaPergunta.ToTable("partida_perguntas");
            partidaPergunta.HasKey(x => new { x.PartidaIndividualId, x.PerguntaId });
            partidaPergunta.HasIndex(x => new { x.PartidaIndividualId, x.Ordem }).IsUnique();
            partidaPergunta.HasOne<PartidaIndividual>().WithMany().HasForeignKey(x => x.PartidaIndividualId).OnDelete(DeleteBehavior.Cascade);
            partidaPergunta.HasOne<Pergunta>().WithMany().HasForeignKey(x => x.PerguntaId);
        });

        modelBuilder.Entity<RespostaIndividual>(resposta =>
        {
            resposta.ToTable("respostas_individuais");
            resposta.HasKey(x => x.RespostaIndividualId);
            resposta.Property(x => x.DataResposta).HasDefaultValueSql("now()");
            resposta.HasIndex(x => new { x.PartidaIndividualId, x.PerguntaId }).IsUnique();
            resposta.HasIndex(x => x.PerguntaId).HasDatabaseName("idx_respostas_individuais_pergunta");
            resposta.HasOne<PartidaPergunta>().WithMany()
                .HasForeignKey(x => new { x.PartidaIndividualId, x.PerguntaId })
                .OnDelete(DeleteBehavior.Cascade);
            resposta.HasOne<Alternativa>().WithMany()
                .HasForeignKey(x => new { x.AlternativaId, x.PerguntaId })
                .HasPrincipalKey(x => new { x.AlternativaId, x.PerguntaId });
        });
    }

    private static void MapearSalas(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Sala>(sala =>
        {
            sala.ToTable("salas");
            sala.HasKey(x => x.SalaId);
            sala.HasIndex(x => x.Codigo).IsUnique();
            sala.Property(x => x.UsaCronometro).HasDefaultValue(false);
            sala.Property(x => x.Status).HasDefaultValue("aguardando");
            sala.Property(x => x.RodadaAtual).HasDefaultValue((short)1);
            sala.Property(x => x.DataCriacao).HasDefaultValueSql("now()");
            sala.HasIndex(x => new { x.ModeradorId, x.DataCriacao })
                .IsDescending(false, true)
                .HasDatabaseName("idx_salas_moderador_data");
            sala.HasOne<Moderador>().WithMany().HasForeignKey(x => x.ModeradorId);
        });

        modelBuilder.Entity<SalaCategoria>(salaCategoria =>
        {
            salaCategoria.ToTable("sala_categorias");
            salaCategoria.HasKey(x => new { x.SalaId, x.CategoriaId });
            salaCategoria.HasOne<Sala>().WithMany().HasForeignKey(x => x.SalaId).OnDelete(DeleteBehavior.Cascade);
            salaCategoria.HasOne<Categoria>().WithMany().HasForeignKey(x => x.CategoriaId);
        });

        modelBuilder.Entity<SalaPergunta>(salaPergunta =>
        {
            salaPergunta.ToTable("sala_perguntas");
            salaPergunta.HasKey(x => x.SalaPerguntaId);
            salaPergunta.HasIndex(x => new { x.SalaId, x.Ordem }).IsUnique();
            salaPergunta.HasIndex(x => new { x.SalaId, x.PerguntaId }).IsUnique();
            salaPergunta.HasOne<Sala>().WithMany().HasForeignKey(x => x.SalaId).OnDelete(DeleteBehavior.Cascade);
            salaPergunta.HasOne<Pergunta>().WithMany().HasForeignKey(x => x.PerguntaId);
        });

        modelBuilder.Entity<Exibicao>(exibicao =>
        {
            exibicao.ToTable("exibicoes");
            exibicao.HasKey(x => new { x.SalaPerguntaId, x.Rodada });
            exibicao.Property(x => x.DataAbertura).HasDefaultValueSql("now()");
            exibicao.HasOne<SalaPergunta>().WithMany().HasForeignKey(x => x.SalaPerguntaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SalaPerguntaAlternativa>(salaPerguntaAlternativa =>
        {
            salaPerguntaAlternativa.ToTable("sala_pergunta_alternativas");
            salaPerguntaAlternativa.HasKey(x => new { x.SalaPerguntaId, x.AlternativaId });
            salaPerguntaAlternativa.HasIndex(x => new { x.SalaPerguntaId, x.Posicao }).IsUnique();
            salaPerguntaAlternativa.HasOne<SalaPergunta>().WithMany().HasForeignKey(x => x.SalaPerguntaId).OnDelete(DeleteBehavior.Cascade);
            salaPerguntaAlternativa.HasOne<Alternativa>().WithMany().HasForeignKey(x => x.AlternativaId);
        });
    }

    private static void MapearRespostasDasSalas(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Participante>(participante =>
        {
            participante.ToTable("participantes");
            participante.HasKey(x => x.ParticipanteId);
            participante.Property(x => x.DataEntrada).HasDefaultValueSql("now()");
            participante.Property(x => x.DataUltimoAcesso).HasDefaultValueSql("now()");
            participante.HasIndex(x => new { x.SalaId, x.VisitanteId }).IsUnique();
            participante.HasIndex(x => x.VisitanteId).HasDatabaseName("idx_participantes_visitante");
            participante.HasOne<Sala>().WithMany().HasForeignKey(x => x.SalaId).OnDelete(DeleteBehavior.Cascade);
            participante.HasOne<Visitante>().WithMany().HasForeignKey(x => x.VisitanteId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Resposta>(resposta =>
        {
            resposta.ToTable("respostas");
            resposta.HasKey(x => x.RespostaId);
            resposta.Property(x => x.DataResposta).HasDefaultValueSql("now()");
            resposta.HasIndex(x => new { x.SalaPerguntaId, x.Rodada, x.ParticipanteId }).IsUnique();
            resposta.HasIndex(x => x.ParticipanteId).HasDatabaseName("idx_respostas_participante");
            resposta.HasOne<Participante>().WithMany().HasForeignKey(x => x.ParticipanteId).OnDelete(DeleteBehavior.Cascade);
            resposta.HasOne<Exibicao>().WithMany()
                .HasForeignKey(x => new { x.SalaPerguntaId, x.Rodada })
                .OnDelete(DeleteBehavior.Cascade);
            resposta.HasOne<SalaPerguntaAlternativa>().WithMany()
                .HasForeignKey(x => new { x.SalaPerguntaId, x.AlternativaId })
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
