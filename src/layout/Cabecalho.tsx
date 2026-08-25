import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function Cabecalho() {
  const navegar = useNavigate();
  const [termoBusca, setTermoBusca] = useState("");

  const aoEnviarBusca = (e: FormEvent) => {
    e.preventDefault();
    const termoBuscaLimpo = termoBusca.trim();
    if (termoBuscaLimpo.length > 0) {
      navegar(`/buscar?q=${encodeURIComponent(termoBuscaLimpo)}`);
    }
  };

  return (
    <header className="app-cabecalho">
      <div className="container d-flex align-items-center justify-content-between gap-3 flex-wrap py-3">
        <a href="/" className="d-flex align-items-center gap-2 text-decoration-none marca-bloco">
          <img src="/mascote-fe.svg" alt="Mascote Fê" className="marca-mascote" />
          <span className="d-flex flex-column">
            <span className="marca-titulo">
              Feevale <span className="marca-destaque">Prouni</span>
            </span>
            <span className="marca-subtitulo">UNIVERSIDADE FEEVALE</span>
          </span>
        </a>

        <div className="d-flex align-items-center gap-3">
          <form className="form-busca" onSubmit={aoEnviarBusca} role="search">
            <i className="bi bi-search icone-busca" aria-hidden="true" />
            <input
              type="search"
              className="form-control campo-busca"
              placeholder="Buscar dúvida..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              aria-label="Buscar dúvida"
            />
          </form>

          <img
            src="/logo-feevale.png"
            alt="Logo da Universidade Feevale"
            className="logo-feevale"
          />
        </div>
      </div>
    </header>
  );
}
