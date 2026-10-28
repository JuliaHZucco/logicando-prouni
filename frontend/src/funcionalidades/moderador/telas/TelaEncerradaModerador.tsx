import { Link } from "react-router-dom";
import Podio from "../../../componentes/Podio";
import type { EstadoSala } from "../../salas/tipos";

interface PropsTelaEncerradaModerador {
  estado: EstadoSala;
}

export default function TelaEncerradaModerador({ estado }: PropsTelaEncerradaModerador) {
  return (
    <section className="sala-cartao text-center moderador-encerrada">
      <img src="/mascote-fe.svg" alt="Mascote Fê" className="sala-mascote" />
      <div className="sala-rotulo">
        {estado.nome.toUpperCase()} · SALA {estado.codigo}
      </div>
      <h1 className="sala-titulo">Sala encerrada</h1>
      <p className="sala-texto">Os participantes viram o resultado final. As respostas ficam guardadas para análise.</p>

      <div className="moderador-totais">
        <div>
          <div className="moderador-total-numero">{estado.totalParticipantes}</div>
          <div className="sala-texto">{estado.totalParticipantes === 1 ? "participante" : "participantes"}</div>
        </div>
        <div>
          <div className="moderador-total-numero">{estado.quantidadePerguntas}</div>
          <div className="sala-texto">{estado.quantidadePerguntas === 1 ? "pergunta" : "perguntas"}</div>
        </div>
        <div>
          <div className="moderador-total-numero">{estado.rodada}</div>
          <div className="sala-texto">{estado.rodada === 1 ? "rodada" : "rodadas"}</div>
        </div>
      </div>

      <Podio ranking={estado.ranking ?? []} />

      <div className="d-flex flex-column gap-2 mt-4">
        <Link to={`/moderador/sala/${estado.codigo}/ranking`} className="quiz-botao-iniciar text-decoration-none">
          Ver ranking geral
        </Link>
        <Link to="/moderador/salas" className="quiz-botao-secundario text-decoration-none">
          Voltar para minhas salas
        </Link>
      </div>
    </section>
  );
}
