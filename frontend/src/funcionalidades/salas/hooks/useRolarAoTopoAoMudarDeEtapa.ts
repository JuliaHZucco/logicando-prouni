import { useEffect } from "react";
import type { EstadoSala } from "../tipos";

export function useRolarAoTopoAoMudarDeEtapa(estado: EstadoSala | null) {
  const status = estado?.status;
  const perguntaAtual = estado?.perguntaAtual;
  const rodada = estado?.rodada;

  useEffect(() => {
    if (status === undefined) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [status, perguntaAtual, rodada]);
}
