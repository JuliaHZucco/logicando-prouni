import GraficoDeFatias from "../../../componentes/GraficoDeFatias";
import type { PerguntaSala, ResultadoPergunta } from "../../salas/tipos";
import type { PropsTelaDaSala } from "./propsDaSala";
import { classeDaAlternativa } from "../../quiz/utilitarios/alternativas";
import CabecalhoDaSala from "../componentes/CabecalhoDaSala";

interface PropsTelaResultadoModerador extends PropsTelaDaSala {
  pergunta: PerguntaSala;
  resultado: ResultadoPergunta;
}

export default function TelaResultadoModerador({
  estado,
  pergunta,
  resultado,
  ocupado,
  aoAcionar,
  aoPedirEncerramento,
}: PropsTelaResultadoModerador) {
  const ehAUltima = pergunta.ordem >= pergunta.total;

  return (
    <>
      <CabecalhoDaSala
        codigo={estado.codigo}
        rodada={estado.rodada}
        etapa={`Resultado da pergunta ${pergunta.ordem} de ${pergunta.total}`}
        className="mb-3"
      />

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <section className="sala-cartao text-center h-100">
            <h1 className="sala-pergunta mb-3 text-start">{pergunta.enunciado}</h1>
            <GraficoDeFatias
              fatias={resultado.grafico.map((barra) => ({
                valor: barra.respostas,
                correta: barra.alternativaId === resultado.alternativaCorretaId,
                classe: classeDaAlternativa(barra.posicao - 1),
                rotulo: barra.texto,
              }))}
            />
            <p className="sala-aviso mt-3">A fatia com borda verde é a resposta correta.</p>
          </section>
        </div>

        <div className="col-12 col-lg-6">
          <section className="sala-cartao">
            <div className="sala-rotulo">RESPOSTAS DA SALA ({resultado.totalRespostas})</div>
            <div className="d-flex flex-column gap-2 mb-3">
              {resultado.grafico.map((barra) => {
                const correta = barra.alternativaId === resultado.alternativaCorretaId;
                return (
                  <div className={`moderador-legenda ${classeDaAlternativa(barra.posicao - 1)}`} key={barra.alternativaId}>
                    <span className="moderador-legenda-cor" />
                    <span className="flex-grow-1">
                      {String.fromCharCode(64 + barra.posicao)} · {barra.texto}
                      {correta ? " ✓ correta" : ""}
                    </span>
                    <strong>
                      {barra.respostas} ({Math.round(barra.percentual)}%)
                    </strong>
                  </div>
                );
              })}
            </div>

            <p className="sala-texto">
              Acertos: {resultado.acertos} · Erros: {resultado.erros} · Não responderam: {resultado.naoResponderam}
            </p>

            <div className="quiz-resposta-revelada mb-3">
              <strong>Explicação:</strong> {resultado.explicacao}
            </div>

            <div className="d-flex flex-column gap-2">
              <button type="button" className="quiz-botao-iniciar" onClick={() => aoAcionar("Avancar")} disabled={ocupado}>
                {ehAUltima ? "Última pergunta: ver ranking final" : "Próxima pergunta"}
              </button>
              <button type="button" className="quiz-botao-iniciar botao-perigo alt-d" onClick={aoPedirEncerramento} disabled={ocupado}>
                Encerrar sala
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
