import { Link } from "react-router-dom";
import type { Categoria } from "../funcionalidades/duvidas/tipos";
import BarraProgresso from "./BarraProgresso";

interface PropsCardCategoria {
  categoria: Categoria;
  categoriaDuvidasVistas: number;
}

export default function CardCategoria({
  categoria,
  categoriaDuvidasVistas,
}: PropsCardCategoria) {
  const categoriaDuvidasTotal = categoria.categoriaDuvidas.length;

  return (
    <Link to={`/categoria/${categoria.categoriaId}`} className="card-base card-categoria">
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
            progressoValorTotal={categoriaDuvidasTotal}
          />
          <span className="contagem-categoria">
            {categoriaDuvidasVistas}/{categoriaDuvidasTotal}
          </span>
        </div>
      </div>
    </Link>
  );
}