import { useEffect, useState } from "react";

export function useContagemRegressiva(segundosIniciais: number | null, chave: number): number | null {
  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(segundosIniciais);

  useEffect(() => {
    if (segundosIniciais === null) {
      setSegundosRestantes(null);
      return;
    }

    const momentoFinal = Date.now() + segundosIniciais * 1000;
    setSegundosRestantes(segundosIniciais);
    const intervalo = setInterval(() => {
      setSegundosRestantes(Math.max(0, Math.ceil((momentoFinal - Date.now()) / 1000)));
    }, 250);

    return () => clearInterval(intervalo);
  }, [segundosIniciais, chave]);

  return segundosRestantes;
}

export function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  return `${minutos}:${String(segundos % 60).padStart(2, "0")}`;
}
