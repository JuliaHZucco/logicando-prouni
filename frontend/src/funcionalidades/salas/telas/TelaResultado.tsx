import type { EstadoSala, ResultadoPergunta } from "../tipos";
import { classeDaAlternativa } from "../../quiz/utilitarios/alternativas";

interface PropsTelaResultado {
  estado: EstadoSala;
  resultado: ResultadoPergunta;
}

export default function TelaResultado({ estado, resultado }: PropsTelaResultado) {
  const respondeu = estado.minhaAlternativaId !== null;
  const acertou = estado.minhaAlternativaId === resultado.alternativaCorretaId;
  const letraCorreta = resultado.grafico.find((x) => x.alternativaId === resultado.alternativaCorretaId)?.posicao ?? 1;
  const classeDoResultado = acertou ? "certa" : "errada";

  return (
    <>
      <div className={`quiz-feedback quiz-feedback-${classeDoResultado} sala-resultado-topo`} role="status">
        <i className={`bi ${acertou ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} aria-hidden="true" />
        <strong>{acertou ? "Você acertou!" : respondeu ? "Não foi dessa vez." : "Você não respondeu."}</strong>
      </div>

      <section className="sala-cartao">
        <div className="sala-rotulo">COMO A SALA RESPONDEU</div>
        <div className="sala-grafico">
          {resultado.grafico.map((barra) => {
            const correta = barra.alternativaId === resultado.alternativaCorretaId;
            return (
              <div className={`sala-grafico-linha ${classeDaAlternativa(barra.posicao - 1)} ${correta ? "correta" : ""}`} key={barra.alternativaId}>
                <div className="sala-grafico-rotulo">
                  <span className="sala-grafico-titulo">
                    <span className="sala-grafico-letra">{String.fromCharCode(64 + barra.posicao)}</span>
                    {barra.respostas} ({Math.round(barra.percentual)}%)
                    {correta ? " ✓" : ""}
                  </span>
                  {barra.alternativaId === estado.minhaAlternativaId && <small>sua resposta</small>}
                </div>
                <div className="sala-grafico-trilha">
                  <div
                    className="sala-grafico-barra"
                    style={{ width: `${barra.percentual}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {resultado.naoResponderam > 0 && (
          <p className="sala-texto mt-3 mb-0">Não responderam: {resultado.naoResponderam}</p>
        )}
      </section>

      <section className="quiz-resposta-revelada">
        <strong>Resposta correta: {String.fromCharCode(64 + letraCorreta)}.</strong> {resultado.explicacao}
      </section>

      <p className="sala-aviso">Aguarde o moderador abrir a próxima pergunta.</p>
    </>
  );
}
