import { Link } from "react-router-dom";

export default function ChamadaQuiz() {
  return (
    <Link to="/quiz" className="chamada-quiz d-flex align-items-center gap-3 text-decoration-none">
      <span className="chamada-quiz-icone">
        <i className="bi bi-controller" aria-hidden="true" />
      </span>
      <div className="chamada-quiz-texto">
        <div className="chamada-quiz-eyebrow">QUIZ DO PROUNI</div>
        <div className="chamada-quiz-titulo">Teste o que você aprendeu</div>
      </div>
      <span className="chamada-quiz-selo">Começar</span>
    </Link>
  );
}
