import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { buscarDuvidasVistas, registrarDuvidaVista } from "../servicos/conteudoApi";
import { useConteudo } from "../hooks/useConteudo";
import { ContextoVisualizacoes } from "./ContextoVisualizacoes";

export default function ProvedorVisualizacoes({ children }: { children: ReactNode }) {
  const { totalGeralDuvidas } = useConteudo();
  const [duvidaIdsVistas, setDuvidaIdsVistas] = useState<Set<string>>(new Set());
  const duvidaIdsJaConhecidas = useRef(new Set<string>());

  useEffect(() => {
    buscarDuvidasVistas()
      .then((ids) => {
        ids.forEach((id) => duvidaIdsJaConhecidas.current.add(id));
        setDuvidaIdsVistas((atuais) => new Set([...atuais, ...ids]));
      })
      .catch(() => undefined);
  }, []);

  const marcarDuvidaComoVista = useCallback((duvidaId: string) => {
    if (duvidaIdsJaConhecidas.current.has(duvidaId)) return;
    duvidaIdsJaConhecidas.current.add(duvidaId);
    setDuvidaIdsVistas((atuais) => new Set(atuais).add(duvidaId));
    registrarDuvidaVista(duvidaId).catch(() => undefined);
  }, []);

  const valor = useMemo(
    () => ({
      duvidaIdsVistas,
      marcarDuvidaComoVista,
      totalDuvidasVistas: duvidaIdsVistas.size,
      totalGeralDuvidas,
      contarDuvidasVistasNaCategoria: (duvidaIdsDaCategoria: string[]) =>
        duvidaIdsDaCategoria.filter((duvidaId) => duvidaIdsVistas.has(duvidaId)).length,
    }),
    [duvidaIdsVistas, marcarDuvidaComoVista, totalGeralDuvidas],
  );

  return <ContextoVisualizacoes.Provider value={valor}>{children}</ContextoVisualizacoes.Provider>;
}
