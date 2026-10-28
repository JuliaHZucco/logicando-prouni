import { formatarTempo, useContagemRegressiva } from "../../salas/hooks/useContagemRegressiva";
import type { PerguntaSala } from "../../salas/tipos";
import type { PropsTelaDaSala } from "./propsDaSala";
import { classeDaAlternativa } from "../../quiz/utilitarios/alternativas";
import CabecalhoDaSala from "../componentes/CabecalhoDaSala";

interface PropsTelaPerguntaModerador extends PropsTelaDaSala {
  pergunta: PerguntaSala;
}

export default function TelaPerguntaModerador({
  estado,
  pergunta,
  ocupado,
  aoAcionar,
  aoPedirEncerramento,
}: PropsTelaPerguntaModerador) {
  const segundosRestantes = useContagemRegressiva(pergunta.segundosRestantes, pergunta.ordem);
  const proporcaoDoTempo =
    segundosRestantes !== null && estado.segundosPorPergunta
      ? (segundosRestantes / estado.segundosPorPergunta) * 100
      : null;
  const proporcaoDeRespostas = estado.totalParticipantes
    ? Math.min(100, (pergunta.respondidas / estado.totalParticipantes) * 100)
    : 0;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <CabecalhoDaSala
          codigo={estado.codigo}
          rodada={estado.rodada}
          etapa={`Pergunta ${pergunta.ordem} de ${pergunta.total}`}
        />
        {segundosRestantes !== null && <span className="sala-cronometro">{formatarTempo(segundosRestantes)}</span>}
      </div>
      {proporcaoDoTempo !== null && (
        <div className="sala-tempo-trilha mb-3">
          <div className="sala-tempo-barra" style={{ width: `${proporcaoDoTempo}%` }} />
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <section className="sala-cartao">
            <h1 className="sala-pergunta mb-3">{pergunta.enunciado}</h1>
            <div className="quiz-opcoes-resposta">
              {pergunta.alternativas.map((alternativa) => (
                <div className={`quiz-opcao-resposta moderador-opcao ${classeDaAlternativa(alternativa.posicao - 1)}`} key={alternativa.alternativaId}>
                  <span className="quiz-opcao-resposta-letra">{String.fromCharCode(64 + alternativa.posicao)}</span>
                  <span>{alternativa.texto}</span>
                </div>
              ))}
            </div>
            <p className="sala-aviso mt-3">
              A alternativa correta fica oculta até a pergunta ser encerrada, inclusive para você.
            </p>
          </section>
        </div>

        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          <section className="sala-cartao">
            <div className="sala-rotulo">RESPOSTAS RECEBIDAS</div>
            <div className="moderador-contador">
              {pergunta.respondidas}
              <span> de {estado.totalParticipantes}</span>
            </div>
            <div className="sala-tempo-trilha">
              <div className="sala-grafico-barra correta" style={{ width: `${proporcaoDeRespostas}%` }} />
            </div>
          </section>

          <button type="button" className="quiz-botao-iniciar" onClick={() => aoAcionar("EncerrarPergunta")} disabled={ocupado}>
            Encerrar pergunta agora
          </button>
          <button type="button" className="quiz-botao-iniciar botao-perigo alt-d" onClick={aoPedirEncerramento} disabled={ocupado}>
            Encerrar sala
          </button>
          <div className="sala-aviso">Quando o tempo acaba, a pergunta fecha sozinha.</div>
        </div>
      </div>
    </>
  );
}
