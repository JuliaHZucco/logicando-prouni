import { Link } from "react-router-dom";
import AbasQuiz from "./AbasQuiz";

interface PropsCabecalhoDoQuiz {
  abaAtiva: "sozinho" | "sala";
}

export default function CabecalhoDoQuiz({ abaAtiva }: PropsCabecalhoDoQuiz) {
  return (
    <>
      <Link to="/" className="link-voltar mb-4 d-inline-flex align-items-center">
        <i className="bi bi-arrow-left me-2" aria-hidden="true" />
        Voltar ao início
      </Link>

      <div className="quiz-menu-header mb-4">
        <h1 className="quiz-menu-titulo mb-2">
          <span className="quiz-menu-titulo-icone" aria-hidden="true">
            <i className="bi bi-controller" />
          </span>
          <span className="quiz-menu-titulo-texto">Quiz do Prouni</span>
        </h1>
        <p className="quiz-menu-subtitulo mb-0">Escolha como praticar</p>
      </div>

      <AbasQuiz abaAtiva={abaAtiva} />
    </>
  );
}
