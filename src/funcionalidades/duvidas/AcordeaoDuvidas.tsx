import { useEffect, useState } from "react";
import type { ItemDuvida } from "./tipos";
import { useVisualizacoes } from "./hooks/useVisualizacoes";

interface PropsAcordeaoDuvidas {
  duvidasExibidas: ItemDuvida[];
  obterRotuloCategoriaDaDuvida?: (duvida: ItemDuvida) => string | undefined;
  duvidaIdAbertaPadrao?: string;
}

export default function AcordeaoDuvidas({
  duvidasExibidas,
  obterRotuloCategoriaDaDuvida,
  duvidaIdAbertaPadrao,
}: PropsAcordeaoDuvidas) {
  const { marcarDuvidaComoVista, duvidaIdsVistas } = useVisualizacoes();
  const [duvidaIdAberta, setDuvidaIdAberta] = useState<string | null>(
    duvidaIdAbertaPadrao ?? null
  );

  useEffect(() => {
    if (duvidaIdAbertaPadrao) marcarDuvidaComoVista(duvidaIdAbertaPadrao);
  }, [duvidaIdAbertaPadrao]);

  const alternarDuvida = (duvidaId: string) => {
    const vaiAbrir = duvidaIdAberta !== duvidaId;
    setDuvidaIdAberta(vaiAbrir ? duvidaId : null);
    if (vaiAbrir) marcarDuvidaComoVista(duvidaId);
  };

  return (
    <div className="lista-duvidas d-flex flex-column gap-3">
      {duvidasExibidas.map((duvida) => {
        const duvidaEstaAberta = duvidaIdAberta === duvida.duvidaId;
        const rotuloCategoria = obterRotuloCategoriaDaDuvida?.(duvida);
        return (
          <div
            key={duvida.duvidaId}
            className={`card-base card-duvida ${duvidaEstaAberta ? "card-duvida-aberto" : ""}`}
          >
            <button
              type="button"
              className="duvida-pergunta"
              onClick={() => alternarDuvida(duvida.duvidaId)}
              aria-expanded={duvidaEstaAberta}
            >
              <span className="d-flex flex-column align-items-start text-start">
                {rotuloCategoria && <span className="duvida-eyebrow">{rotuloCategoria}</span>}
                <span className="duvida-pergunta-texto">
                  {duvida.duvidaPergunta}
                  {duvidaIdsVistas.has(duvida.duvidaId) && !duvidaEstaAberta && (
                    <i
                      className="bi bi-check-circle-fill duvida-vista-marcador"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </span>
              <i
                className={`bi ${duvidaEstaAberta ? "bi-chevron-up" : "bi-chevron-down"} duvida-chevron`}
                aria-hidden="true"
              />
            </button>
            {duvidaEstaAberta && (
              <div className="duvida-resposta">
                <p className="mb-0">{duvida.duvidaResposta}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
