import { createContext } from "react";

export interface ValorContextoVisualizacoes {
  duvidaIdsVistas: Set<string>;
  marcarDuvidaComoVista: (duvidaId: string) => void;
  totalDuvidasVistas: number;
  totalGeralDuvidas: number;
  contarDuvidasVistasNaCategoria: (duvidaIdsDaCategoria: string[]) => number;
}

export const ContextoVisualizacoes = createContext<ValorContextoVisualizacoes | null>(null);
