import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Cabecalho from "./layout/Cabecalho";
import Rodape from "./layout/Rodape";
import Inicio from "./paginas/Inicio";
import PaginaCategoria from "./paginas/PaginaCategoria";
import ResultadoBusca from "./paginas/ResultadoBusca";
import PaginaQuizMenu from "./paginas/PaginaQuizMenu";
import PaginaQuizJogo from "./paginas/PaginaQuizJogo";
import { ProvedorVisualizacoes } from "./funcionalidades/duvidas/contexto/ContextoVisualizacoes";

function ScrollParaOTopo() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <ProvedorVisualizacoes>
      <div className="estrutura-app d-flex flex-column min-vh-100">
        <ScrollParaOTopo />
        <Cabecalho />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/categoria/:categoriaId" element={<PaginaCategoria />} />
            <Route path="/buscar" element={<ResultadoBusca />} />
            <Route path="/quiz" element={<PaginaQuizMenu />} />
            <Route path="/quiz/jogar" element={<PaginaQuizJogo />} />
          </Routes>
        </main>
        <Rodape />
      </div>
    </ProvedorVisualizacoes>
  );
}
