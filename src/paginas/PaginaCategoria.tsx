import { Link, Navigate, useParams } from "react-router-dom";
import { categorias } from "../funcionalidades/duvidas/dados/conteudo";
import { useVisualizacoes } from "../funcionalidades/duvidas/hooks/useVisualizacoes";
import AcordeaoDuvidas from "../funcionalidades/duvidas/AcordeaoDuvidas";
import ChamadaQuiz from "../funcionalidades/duvidas/ChamadaQuiz";
import BarraProgresso from "../componentes/BarraProgresso";

export default function PaginaCategoria() {
  const { categoriaId } = useParams<{ categoriaId: string }>();
  const categoriaSelecionada = categorias.find((c) => c.categoriaId === categoriaId);
  const { contarDuvidasVistasNaCategoria } = useVisualizacoes();

  if (!categoriaSelecionada) {
    return <Navigate to="/" replace />;
  }

  const categoriaDuvidaIds = categoriaSelecionada.categoriaDuvidas.map((d) => d.duvidaId);
  const categoriaDuvidasVistas = contarDuvidasVistasNaCategoria(categoriaDuvidaIds);

  return (
    <div className="container py-4">
      <Link to="/" className="link-voltar mb-4">
        <i className="bi bi-arrow-left me-2" aria-hidden="true" />
        Voltar às categorias
      </Link>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h1 className="titulo-secao mb-0">{categoriaSelecionada.categoriaNome}</h1>
        <span className="text-muted small">
          {categoriaDuvidasVistas}/{categoriaDuvidaIds.length} vistas
        </span>
      </div>

      <div className="mb-4">
        <BarraProgresso
          progressoValorAtual={categoriaDuvidasVistas}
          progressoValorTotal={categoriaDuvidaIds.length}
        />
      </div>

      <AcordeaoDuvidas
        duvidasExibidas={categoriaSelecionada.categoriaDuvidas}
        duvidaIdAbertaPadrao={categoriaSelecionada.categoriaDuvidas[0]?.duvidaId}
      />

      <div className="mt-4">
        <ChamadaQuiz />
      </div>
    </div>
  );
}
