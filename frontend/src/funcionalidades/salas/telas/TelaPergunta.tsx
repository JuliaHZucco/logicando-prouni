import { useState } from "react";
import Alerta from "../../../componentes/Alerta";
import { formatarTempo, useContagemRegressiva } from "../hooks/useContagemRegressiva";
import type { EstadoSala, PerguntaSala, ResultadoAcao } from "../tipos";
import { classeDaAlternativa } from "../../quiz/utilitarios/alternativas";

interface PropsTelaPergunta {
  estado: EstadoSala;
  pergunta: PerguntaSala;
  aoResponder: (alternativaId: number) => Promise<ResultadoAcao>;
}

export default function TelaPergunta({ estado, pergunta, aoResponder }: PropsTelaPergunta) {
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const segundosRestantes = useContagemRegressiva(pergunta.segundosRestantes, pergunta.ordem);
  const jaRespondeu = estado.minhaAlternativaId !== null;
  const alternativaMarcada = pergunta.alternativas.find((x) => x.alternativaId === estado.minhaAlternativaId);

  const responder = async (alternativaId: number) => {
    setEnviando(true);
    setMensagemErro(null);
    const resultado = await aoResponder(alternativaId);
    if (!resultado.ok) setMensagemErro(resultado.erro ?? "Resposta não aceita.");
    setEnviando(false);
  };

  const proporcaoDoTempo =
    segundosRestantes !== null && estado.segundosPorPergunta
      ? (segundosRestantes / estado.segundosPorPergunta) * 100
      : null;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <span className="sala-rotulo mb-0">
          PERGUNTA {pergunta.ordem} DE {pergunta.total}
        </span>
        {segundosRestantes !== null && <span className="sala-cronometro">{formatarTempo(segundosRestantes)}</span>}
      </div>
      {proporcaoDoTempo !== null && (
        <div className="sala-tempo-trilha">
          <div className="sala-tempo-barra" style={{ width: `${proporcaoDoTempo}%` }} />
        </div>
      )}

      {jaRespondeu ? (
        <section className="sala-cartao text-center">
          <i className="bi bi-check-circle-fill sala-icone-enviada" aria-hidden="true" />
          <h1 className="sala-titulo">Resposta enviada!</h1>
          <p className="sala-texto">Você marcou a alternativa:</p>
          {alternativaMarcada && (
            <div className={`sala-resposta-marcada ${classeDaAlternativa(alternativaMarcada.posicao - 1)}`}>
              <span className="quiz-opcao-resposta-letra">{String.fromCharCode(64 + alternativaMarcada.posicao)}</span>
              {alternativaMarcada.texto}
            </div>
          )}
          <p className="sala-texto mt-3 mb-0">
            Aguardando os outros participantes e o fim do tempo. A resposta não pode ser trocada.
          </p>
        </section>
      ) : (
        <>
          <section className="sala-cartao">
            <h1 className="sala-pergunta">{pergunta.enunciado}</h1>
          </section>

          <div className="quiz-opcoes-resposta" role="group" aria-label="Opções de resposta">
            {pergunta.alternativas.map((alternativa) => (
              <button
                type="button"
                key={alternativa.alternativaId}
                className={`quiz-opcao-resposta ${classeDaAlternativa(alternativa.posicao - 1)}`}
                disabled={enviando}
                onClick={() => responder(alternativa.alternativaId)}
              >
                <span className="quiz-opcao-resposta-letra">{String.fromCharCode(64 + alternativa.posicao)}</span>
                <span>{alternativa.texto}</span>
              </button>
            ))}
          </div>

          {mensagemErro && <Alerta mensagem={mensagemErro} />}
          <p className="sala-aviso">A resposta certa só aparece quando a pergunta fechar.</p>
        </>
      )}
    </>
  );
}
