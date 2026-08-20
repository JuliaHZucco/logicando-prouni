import { Route, Routes } from "react-router-dom";
import Cabecalho from "./layout/Cabecalho";
import Rodape from "./layout/Rodape";
import Inicio from "./paginas/Inicio";
import PaginaCategoria from "./paginas/PaginaCategoria";
import ResultadoBusca from "./paginas/ResultadoBusca";
import { ProvedorVisualizacoes } from "./funcionalidades/duvidas/contexto/ContextoVisualizacoes";

export default function App() {
  return (
    <ProvedorVisualizacoes>
      <div className="estrutura-app d-flex flex-column min-vh-100">
        <Cabecalho />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/categoria/:categoriaId" element={<PaginaCategoria />} />
            <Route path="/buscar" element={<ResultadoBusca />} />
          </Routes>
        </main>
        <Rodape />
      </div>
    </ProvedorVisualizacoes>
  );
}
