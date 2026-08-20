import { Link, useSearchParams } from "react-router-dom";
import { categorias } from "../funcionalidades/duvidas/dados/conteudo";
import type { ItemDuvida } from "../funcionalidades/duvidas/tipos";
import AcordeaoDuvidas from "../funcionalidades/duvidas/AcordeaoDuvidas";

interface DuvidaEncontrada extends ItemDuvida {
  duvidaCategoriaNome: string;
}

function normalizarTextoBusca(textoOriginal: string) {
  return textoOriginal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function ResultadoBusca() {
  const [parametrosBusca] = useSearchParams();
  const termoBusca = parametrosBusca.get("q")?.trim() ?? "";
  const termoBuscaNormalizado = normalizarTextoBusca(termoBusca);

  const duvidasEncontradas: DuvidaEncontrada[] = categorias.flatMap((categoria) =>
    categoria.categoriaDuvidas
      .filter(
        (duvida) =>
          normalizarTextoBusca(duvida.duvidaPergunta).includes(termoBuscaNormalizado) ||
          normalizarTextoBusca(duvida.duvidaResposta).includes(termoBuscaNormalizado)
      )
      .map((duvida) => ({ ...duvida, duvidaCategoriaNome: categoria.categoriaNome }))
  );

  return (
    <div className="container py-4">
      <Link to="/" className="link-voltar mb-4">
        <i className="bi bi-arrow-left me-2" aria-hidden="true" />
        Voltar às categorias
      </Link>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <div className="eyebrow mb-1">RESULTADO DA BUSCA</div>
          <h1 className="titulo-secao mb-0">
            "{termoBusca}" · {duvidasEncontradas.length}{" "}
            {duvidasEncontradas.length === 1 ? "resultado" : "resultados"}
          </h1>
        </div>
        <Link to="/" className="link-limpar">
          Limpar
        </Link>
      </div>

      {duvidasEncontradas.length === 0 ? (
        <p className="text-muted">
          Nenhuma dúvida encontrada para "{termoBusca}". Tente outra palavra-chave
          ou explore as categorias na página inicial.
        </p>
      ) : (
        <AcordeaoDuvidas
          duvidasExibidas={duvidasEncontradas}
          obterRotuloCategoriaDaDuvida={(duvida) =>
            (duvida as DuvidaEncontrada).duvidaCategoriaNome
          }
        />
      )}
    </div>
  );
}
