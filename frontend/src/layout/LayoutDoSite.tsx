import { Outlet } from "react-router-dom";
import Cabecalho from "./Cabecalho";
import Rodape from "./Rodape";
import ProvedorConteudo from "../funcionalidades/duvidas/contexto/ProvedorConteudo";
import ProvedorVisualizacoes from "../funcionalidades/duvidas/contexto/ProvedorVisualizacoes";

export default function LayoutDoSite() {
  return (
    <div className="estrutura-app d-flex flex-column min-vh-100">
      <Cabecalho />
      <main className="flex-grow-1">
        <ProvedorConteudo>
          <ProvedorVisualizacoes>
            <Outlet />
          </ProvedorVisualizacoes>
        </ProvedorConteudo>
      </main>
      <Rodape />
    </div>
  );
}
