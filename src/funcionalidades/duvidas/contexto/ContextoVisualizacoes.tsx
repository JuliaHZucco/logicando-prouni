import { createContext, useMemo, useState, type ReactNode } from "react";
import { totalGeralDuvidas } from "../dados/conteudo";

export interface ValorContextoVisualizacoes {
  duvidaIdsVistas: Set<string>;
  marcarDuvidaComoVista: (duvidaId: string) => void;
  totalDuvidasVistas: number;
  totalGeralDuvidas: number;
  contarDuvidasVistasNaCategoria: (duvidaIdsDaCategoria: string[]) => number;
}

export const ContextoVisualizacoes = createContext<ValorContextoVisualizacoes | null>(null);

export function ProvedorVisualizacoes({ children }: { children: ReactNode }) {
  const [duvidaIdsVistas, setDuvidaIdsVistas] = useState<Set<string>>(new Set());

  const marcarDuvidaComoVista = (duvidaId: string) => {
    setDuvidaIdsVistas((idsAtuais) => {
      if (idsAtuais.has(duvidaId)) return idsAtuais;
      const proximosIds = new Set(idsAtuais);
      proximosIds.add(duvidaId);
      return proximosIds;
    });
  };

  const valor = useMemo<ValorContextoVisualizacoes>(
    () => ({
      duvidaIdsVistas,
      marcarDuvidaComoVista,
      totalDuvidasVistas: duvidaIdsVistas.size,
      totalGeralDuvidas,
      contarDuvidasVistasNaCategoria: (duvidaIdsDaCategoria: string[]) =>
        duvidaIdsDaCategoria.filter((duvidaId) => duvidaIdsVistas.has(duvidaId)).length,
    }),
    [duvidaIdsVistas]
  );

  return (
    <ContextoVisualizacoes.Provider value={valor}>{children}</ContextoVisualizacoes.Provider>
  );
}
