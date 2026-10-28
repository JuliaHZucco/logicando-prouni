import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AreaCarregando from "../componentes/AreaCarregando";
import CabecalhoModerador from "../funcionalidades/moderador/componentes/CabecalhoModerador";
import { buscarModeradorLogado } from "../funcionalidades/moderador/servicos/moderadorApi";
import type { ModeradorLogado } from "../funcionalidades/moderador/tipos";
import { ErroApi } from "../utilitarios/api";

export default function LayoutDoModerador() {
  const [moderador, setModerador] = useState<ModeradorLogado | null>(null);
  const [semSessao, setSemSessao] = useState(false);

  useEffect(() => {
    buscarModeradorLogado()
      .then(setModerador)
      .catch((erro) => {
        if (erro instanceof ErroApi && erro.status === 401) setSemSessao(true);
      });
  }, []);

  if (semSessao) {
    return <Navigate to="/moderador/login" replace />;
  }

  if (!moderador) {
    return (
      <div className="container py-5">
        <AreaCarregando />
      </div>
    );
  }

  return (
    <div className="estrutura-app d-flex flex-column min-vh-100">
      <CabecalhoModerador email={moderador.email} />
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}
