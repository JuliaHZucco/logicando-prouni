import { Link } from "react-router-dom";

export default function PaginaNaoEncontrada() {
  return (
    <div className="container py-5 text-center">
      <div className="eyebrow eyebrow-laranja mb-2">ERRO 404</div>
      <h1 className="titulo-secao mb-3">Página não encontrada</h1>
      <p className="text-muted mb-4">
        O endereço acessado não corresponde a uma página disponível no Feevale Prouni.
      </p>
      <Link to="/" className="quiz-botao-iniciar">
        Voltar ao início
      </Link>
    </div>
  );
}
