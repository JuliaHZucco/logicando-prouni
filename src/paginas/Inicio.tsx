import { Link } from "react-router-dom";
import { categorias } from "../funcionalidades/duvidas/dados/conteudo";
import { useVisualizacoes } from "../funcionalidades/duvidas/hooks/useVisualizacoes";
import ChamadaQuiz from "../funcionalidades/duvidas/ChamadaQuiz";
import BarraProgresso from "../componentes/BarraProgresso";

export default function Inicio() {
  const { totalDuvidasVistas, totalGeralDuvidas, contarDuvidasVistasNaCategoria } =
    useVisualizacoes();

  return (
    <div className="container py-4">
      <section className="card-boas-vindas mb-4">
        <div className="row align-items-center g-4">
          <div className="col-auto">
            <div className="mascote-boas-vindas-wrap">
              <img src="/mascote-fe.svg" alt="Mascote Fê" className="mascote-boas-vindas" />
            </div>
          </div>
          <div className="col">
            <div className="eyebrow eyebrow-laranja mb-2">
              <i className="bi bi-stars me-1" aria-hidden="true" />
              BEM-VINDO(A) AO FEEVALE PROUNI
            </div>
            <h1 className="titulo-boas-vindas mb-3">
              Suas dúvidas do <span className="texto-destaque">PROUNI</span>, resolvidas.
            </h1>
            <p className="texto-boas-vindas mb-0">
              Sou a Fê! Escolha uma categoria abaixo ou busque uma
              palavra-chave para descobrir tudo sobre bolsas de estudo,
              inscrição, prazos e mais.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <div className="eyebrow mb-1">EXPLORE POR TEMA</div>
            <h2 className="titulo-secao mb-0">Categorias</h2>
          </div>
          <div className="d-flex align-items-center gap-2 text-muted small">
            <i className="bi bi-book" aria-hidden="true" />
            {totalDuvidasVistas}/{totalGeralDuvidas} vistas
          </div>
        </div>

        <div className="row g-3">
          {categorias.map((categoria) => {
            const categoriaDuvidaIds = categoria.categoriaDuvidas.map((d) => d.duvidaId);
            const categoriaDuvidasVistas = contarDuvidasVistasNaCategoria(categoriaDuvidaIds);
            return (
              <div className="col-12 col-md-6" key={categoria.categoriaId}>
                <Link to={`/categoria/${categoria.categoriaId}`} className="card-categoria">
                  <div className="icone-categoria">
                    <i className={`bi ${categoria.categoriaIcone}`} aria-hidden="true" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="nome-categoria">{categoria.categoriaNome}</span>
                      <i className="bi bi-arrow-right seta-categoria" aria-hidden="true" />
                    </div>
                    <p className="descricao-categoria">{categoria.categoriaDescricao}</p>
                    <div className="d-flex align-items-center gap-2">
                      <BarraProgresso
                        progressoValorAtual={categoriaDuvidasVistas}
                        progressoValorTotal={categoriaDuvidaIds.length}
                      />
                      <span className="contagem-categoria">
                        {categoriaDuvidasVistas}/{categoriaDuvidaIds.length}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-4">
        <ChamadaQuiz />
      </div>
    </div>
  );
}
