import { Link } from "react-router-dom";
import Podio from "../../../componentes/Podio";
import type { PropsTelaDaSala } from "./propsDaSala";
import CabecalhoDaSala from "../componentes/CabecalhoDaSala";

export default function TelaRankingModerador({ estado, ocupado, aoAcionar, aoPedirEncerramento }: PropsTelaDaSala) {
  return (
    <>
      <CabecalhoDaSala codigo={estado.codigo} rodada={estado.rodada} nome={estado.nome} className="mb-2" />
      <h1 className="titulo-secao mb-3">
        Ranking final · {estado.quantidadePerguntas} {estado.quantidadePerguntas === 1 ? "pergunta" : "perguntas"}
      </h1>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <section className="sala-cartao">
            <div className="sala-rotulo text-center">OS TRÊS PRIMEIROS COLOCADOS</div>
            <Podio ranking={estado.ranking ?? []} />
          </section>
        </div>

        <div className="col-12 col-lg-4 d-flex flex-column gap-2">
          <Link to={`/moderador/sala/${estado.codigo}/ranking`} className="quiz-botao-iniciar text-decoration-none">
            Ver ranking geral
          </Link>

          <button type="button" className="quiz-botao-secundario" onClick={() => aoAcionar("JogarNovamente")} disabled={ocupado}>
            Jogar novamente
          </button>
          <p className="sala-texto">
            Abre a rodada {estado.rodada + 1} na mesma sala, com os mesmos participantes e o placar zerado. Só o
            moderador vê este botão.
          </p>

          <button type="button" className="quiz-botao-iniciar botao-perigo alt-d" onClick={aoPedirEncerramento} disabled={ocupado}>
            Encerrar sala
          </button>
        </div>
      </div>
    </>
  );
}
