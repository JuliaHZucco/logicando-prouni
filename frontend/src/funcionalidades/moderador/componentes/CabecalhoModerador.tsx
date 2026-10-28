import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sairDoModerador } from "../servicos/moderadorApi";

interface PropsCabecalhoModerador {
  email: string;
}

export default function CabecalhoModerador({ email }: PropsCabecalhoModerador) {
  const navigate = useNavigate();
  const [saindo, setSaindo] = useState(false);

  const sair = async () => {
    setSaindo(true);
    try {
      await sairDoModerador();
    } finally {
      navigate("/moderador/login", { replace: true });
    }
  };

  return (
    <header className="app-cabecalho">
      <div className="container d-flex align-items-center justify-content-between gap-3 flex-wrap py-3">
        <Link to="/moderador/salas" className="d-flex align-items-center gap-2 text-decoration-none marca-bloco">
          <img src="/logo-feevale.png" alt="Logo da Universidade Feevale" className="marca-logo" />
          <span className="d-flex flex-column">
            <span className="marca-titulo marca-titulo-pequena">
              Feevale <span className="marca-destaque">Prouni</span>
            </span>
            <span className="marca-subtitulo-moderador">PAINEL DO MODERADOR</span>
          </span>
        </Link>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="moderador-email">{email}</span>
          <button type="button" className="botao-sair" onClick={sair} disabled={saindo}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
