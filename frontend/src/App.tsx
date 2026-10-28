import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LayoutDoModerador from "./layout/LayoutDoModerador";
import LayoutDoSite from "./layout/LayoutDoSite";
import ProvedorConteudo from "./funcionalidades/duvidas/contexto/ProvedorConteudo";
import Inicio from "./paginas/site/Inicio";
import PaginaCategoria from "./paginas/site/PaginaCategoria";
import PaginaModeradorCriarSala from "./paginas/moderador/PaginaModeradorCriarSala";
import PaginaModeradorLogin from "./paginas/moderador/PaginaModeradorLogin";
import PaginaModeradorRankingGeral from "./paginas/moderador/PaginaModeradorRankingGeral";
import PaginaModeradorSala from "./paginas/moderador/PaginaModeradorSala";
import PaginaModeradorSalas from "./paginas/moderador/PaginaModeradorSalas";
import PaginaNaoEncontrada from "./paginas/site/PaginaNaoEncontrada";
import PaginaQuizEntrarEmSala from "./paginas/quiz/PaginaQuizEntrarEmSala";
import PaginaQuizJogo from "./paginas/quiz/PaginaQuizJogo";
import PaginaQuizMenu from "./paginas/quiz/PaginaQuizMenu";
import PaginaSalaApelido from "./paginas/participante/PaginaSalaApelido";
import PaginaSalaParticipante from "./paginas/participante/PaginaSalaParticipante";
import ResultadoBusca from "./paginas/site/ResultadoBusca";

function ScrollParaOTopo() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollParaOTopo />
      <Routes>
        <Route path="/sala/:codigo" element={<PaginaSalaParticipante />} />
        <Route path="/sala/:codigo/apelido" element={<PaginaSalaApelido />} />

        <Route path="/moderador" element={<LayoutDoModerador />}>
          <Route path="salas" element={<PaginaModeradorSalas />} />
          <Route
            path="salas/nova"
            element={
              <ProvedorConteudo>
                <PaginaModeradorCriarSala />
              </ProvedorConteudo>
            }
          />
          <Route path="sala/:codigo" element={<PaginaModeradorSala />} />
          <Route path="sala/:codigo/ranking" element={<PaginaModeradorRankingGeral />} />
        </Route>

        <Route element={<LayoutDoSite />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/categoria/:categoriaId" element={<PaginaCategoria />} />
          <Route path="/buscar" element={<ResultadoBusca />} />
          <Route path="/quiz" element={<PaginaQuizMenu />} />
          <Route path="/quiz/jogar" element={<PaginaQuizJogo />} />
          <Route path="/quiz/sala" element={<PaginaQuizEntrarEmSala />} />
          <Route path="/moderador/login" element={<PaginaModeradorLogin />} />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Route>
      </Routes>
    </>
  );
}
