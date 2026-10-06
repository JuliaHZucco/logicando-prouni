const chaveHistoricoQuiz = "feevale-prouni-quiz-historico";

export interface EstatisticasPerguntaQuiz {
  acertos: number;
  erros: number;
}

type HistoricoQuiz = Record<string, EstatisticasPerguntaQuiz>;

function lerHistoricoQuiz(): HistoricoQuiz {
  if (typeof window === "undefined") return {};

  try {
    const valorArmazenado = window.localStorage.getItem(chaveHistoricoQuiz);
    if (!valorArmazenado) return {};

    const historicoDeserializado: unknown = JSON.parse(valorArmazenado);
    if (!historicoDeserializado || typeof historicoDeserializado !== "object") return {};

    return Object.entries(historicoDeserializado).reduce<HistoricoQuiz>(
      (historico, [duvidaId, estatisticas]) => {
        if (
          estatisticas &&
          typeof estatisticas === "object" &&
          "acertos" in estatisticas &&
          "erros" in estatisticas &&
          typeof estatisticas.acertos === "number" &&
          typeof estatisticas.erros === "number"
        ) {
          historico[duvidaId] = {
            acertos: estatisticas.acertos,
            erros: estatisticas.erros,
          };
        }
        return historico;
      },
      {},
    );
  } catch (erro) {
    console.error("Não foi possível ler o histórico do quiz.", erro);
    return {};
  }
}

export function registrarResultadoQuiz(duvidaId: string, acertou: boolean): void {
  if (typeof window === "undefined") return;

  try {
    const historico = lerHistoricoQuiz();
    const estatisticasAtuais = historico[duvidaId] ?? { acertos: 0, erros: 0 };

    historico[duvidaId] = {
      acertos: estatisticasAtuais.acertos + (acertou ? 1 : 0),
      erros: estatisticasAtuais.erros + (acertou ? 0 : 1),
    };

    window.localStorage.setItem(chaveHistoricoQuiz, JSON.stringify(historico));
  } catch (erro) {
    console.error("Não foi possível salvar o resultado do quiz.", erro);
  }
}
