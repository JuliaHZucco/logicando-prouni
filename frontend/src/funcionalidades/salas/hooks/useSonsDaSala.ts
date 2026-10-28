import { useEffect, useRef } from "react";
import { tocarSomFinalizacao, tocarSomResposta } from "../../../utilitarios/sons";
import type { EstadoSala, StatusSala } from "../tipos";

const statusDoFimDoQuiz: StatusSala[] = ["ranking", "encerrada"];

export function useSonsDaSala(estado: EstadoSala | null) {
  const statusAnterior = useRef<StatusSala | null>(null);

  useEffect(() => {
    if (!estado?.participante) return;

    const anterior = statusAnterior.current;
    statusAnterior.current = estado.status;
    if (anterior === null || anterior === estado.status) return;

    if (estado.status === "resultado_pergunta" && estado.resultado) {
      tocarSomResposta(estado.minhaAlternativaId === estado.resultado.alternativaCorretaId);
      return;
    }

    if (statusDoFimDoQuiz.includes(estado.status) && !statusDoFimDoQuiz.includes(anterior)) {
      tocarSomFinalizacao((estado.minhaPosicao?.aproveitamento ?? 0) > 50);
    }
  }, [estado]);
}
