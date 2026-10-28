import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type Aba = "sozinho" | "sala";

interface PropsAbasQuiz {
  abaAtiva: Aba;
}

const atrasoParaIniciarODeslize = 30;

export default function AbasQuiz({ abaAtiva }: PropsAbasQuiz) {
  const localizacao = useLocation();
  const abaDeOrigem = (localizacao.state as { abaDeOrigem?: Aba } | null)?.abaDeOrigem;
  const [abaDaPeca, setAbaDaPeca] = useState<Aba>(abaDeOrigem ?? abaAtiva);

  useEffect(() => {
    const temporizador = setTimeout(() => setAbaDaPeca(abaAtiva), atrasoParaIniciarODeslize);
    return () => clearTimeout(temporizador);
  }, [abaAtiva]);

  return (
    <div className="quiz-abas" role="tablist">
      <span className={`quiz-abas-peca ${abaDaPeca === "sala" ? "na-sala" : ""}`} aria-hidden="true" />
      <Link
        to="/quiz"
        state={{ abaDeOrigem: abaAtiva }}
        role="tab"
        aria-selected={abaAtiva === "sozinho"}
        className={`quiz-aba ${abaAtiva === "sozinho" ? "ativa" : ""}`}
      >
        Jogar sozinho
      </Link>
      <Link
        to="/quiz/sala"
        state={{ abaDeOrigem: abaAtiva }}
        role="tab"
        aria-selected={abaAtiva === "sala"}
        className={`quiz-aba ${abaAtiva === "sala" ? "ativa" : ""}`}
      >
        Entrar em uma sala
      </Link>
    </div>
  );
}
