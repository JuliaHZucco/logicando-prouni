import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { totalGeralDuvidas } from "../dados/conteudo";

const nomeCookieVisualizacoes = "feevale-prouni-duvidas-vistas";
const duracaoCookieEmSegundos = 60 * 60 * 24 * 365;

function lerVisualizacoesDoCookie(): Set<string> {
  if (typeof document === "undefined") return new Set();

  const cookieEncontrado = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${nomeCookieVisualizacoes}=`));

  if (!cookieEncontrado) return new Set();

  try {
    const valorCookie = cookieEncontrado.split("=")[1];
    const ids = JSON.parse(decodeURIComponent(valorCookie));
    return Array.isArray(ids) ? new Set(ids.filter((id): id is string => typeof id === "string")) : new Set();
  } catch {
    return new Set();
  }
}

export interface ValorContextoVisualizacoes {
  duvidaIdsVistas: Set<string>;
  marcarDuvidaComoVista: (duvidaId: string) => void;
  totalDuvidasVistas: number;
  totalGeralDuvidas: number;
  contarDuvidasVistasNaCategoria: (duvidaIdsDaCategoria: string[]) => number;
}

export const ContextoVisualizacoes = createContext<ValorContextoVisualizacoes | null>(null);

export function ProvedorVisualizacoes({ children }: { children: ReactNode }) {
  const [duvidaIdsVistas, setDuvidaIdsVistas] = useState<Set<string>>(lerVisualizacoesDoCookie);

  useEffect(() => {
    const valorCookie = encodeURIComponent(JSON.stringify([...duvidaIdsVistas]));
    document.cookie = `${nomeCookieVisualizacoes}=${valorCookie}; max-age=${duracaoCookieEmSegundos}; path=/; SameSite=Lax`;
  }, [duvidaIdsVistas]);

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
