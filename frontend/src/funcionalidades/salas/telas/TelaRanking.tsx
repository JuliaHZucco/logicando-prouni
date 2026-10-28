import Podio from "../../../componentes/Podio";
import type { EstadoSala } from "../tipos";

interface PropsTelaRanking {
  estado: EstadoSala;
}

function ordinal(posicao: number) {
  return `${posicao}º`;
}

export default function TelaRanking({ estado }: PropsTelaRanking) {
  const minha = estado.minhaPosicao;
  const encerrada = estado.status === "encerrada";

  return (
    <>
      <div className="text-center">
        <div className="sala-rotulo">
          {encerrada ? "A SALA FOI ENCERRADA" : `FIM DO QUIZ · ${estado.quantidadePerguntas} ${estado.quantidadePerguntas === 1 ? "PERGUNTA" : "PERGUNTAS"}`}
        </div>
        <h1 className="sala-titulo mb-0">{encerrada ? "Obrigado por participar!" : "Ranking final"}</h1>
      </div>

      <section className="sala-cartao">
        <Podio ranking={estado.ranking ?? []} />
      </section>

      {minha && (
        <section className="sala-cartao sala-posicao">
          <div>
            <div className="sala-rotulo mb-1">{encerrada ? "SEU RESULTADO" : "SUA POSIÇÃO"}</div>
            <div className="sala-posicao-texto">
              {minha.apelido} · {minha.acertos} de {minha.perguntasExibidas}
              {minha.aproveitamento !== null ? ` · ${minha.aproveitamento}%` : ""}
            </div>
            {encerrada && (
              <div className="sala-texto">
                {minha.aproveitamento ?? 0}% de aproveitamento · {ordinal(minha.posicao)} lugar de{" "}
                {estado.totalParticipantes}
              </div>
            )}
          </div>
          <div className="sala-posicao-numero">{ordinal(minha.posicao)}</div>
        </section>
      )}

      <p className="sala-aviso">
        {encerrada
          ? "Obrigado por participar!"
          : "Aparecem só os três primeiros. Empates dividem a posição."}
      </p>
    </>
  );
}
