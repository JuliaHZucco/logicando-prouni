import { useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import AreaCarregando from "../../componentes/AreaCarregando";
import { buscarResultadoDaPartida, repetirPartida, responderPergunta } from "../../funcionalidades/quiz/servicos/quizApi";
import type { PartidaQuiz, ResultadoPartida, ResultadoResposta } from "../../funcionalidades/quiz/tipos";
import { classeDaAlternativa } from "../../funcionalidades/quiz/utilitarios/alternativas";
import { tocarSomFinalizacao, tocarSomResposta } from "../../utilitarios/sons";

interface RespostaDada {
  duvidaId: string;
  duvidaPergunta: string;
  categoriaId: string;
  baseDuvidaId: string;
  correta: boolean;
}

export default function PaginaQuizJogo() {
  const location = useLocation();
  const partidaInicial = (location.state as { partida?: PartidaQuiz } | null)?.partida;

  const [partida, setPartida] = useState<PartidaQuiz | undefined>(partidaInicial);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [alternativaSelecionadaId, setAlternativaSelecionadaId] = useState<number | null>(null);
  const [resultadoResposta, setResultadoResposta] = useState<ResultadoResposta | null>(null);
  const [respostasDadas, setRespostasDadas] = useState<RespostaDada[]>([]);
  const [quizFinalizado, setQuizFinalizado] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState<ResultadoPartida | null>(null);
  const [carregandoResultado, setCarregandoResultado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const perguntas = partida?.perguntas ?? [];
  const perguntaAtual = perguntas[indiceAtual];
  const totalPerguntas = perguntas.length;
  const acertos = respostasDadas.filter((resposta) => resposta.correta).length;

  const progresso = useMemo(() => {
    if (!totalPerguntas) return 0;
    const perguntasConcluidas = quizFinalizado ? totalPerguntas : indiceAtual;
    return (perguntasConcluidas / totalPerguntas) * 100;
  }, [totalPerguntas, indiceAtual, quizFinalizado]);

  if (!partida?.perguntas?.length) {
    return <Navigate to="/quiz" replace />;
  }

  const selecionarOpcao = async (alternativaId: number) => {
    if (!perguntaAtual || resultadoResposta || enviando) return;

    setEnviando(true);
    setMensagemErro(null);
    try {
      const resultado = await responderPergunta(partida.partidaId, perguntaAtual.duvidaId, alternativaId);
      setAlternativaSelecionadaId(alternativaId);
      setResultadoResposta(resultado);
      setRespostasDadas((atuais) => [
        ...atuais,
        {
          duvidaId: perguntaAtual.duvidaId,
          duvidaPergunta: perguntaAtual.duvidaPergunta,
          categoriaId: perguntaAtual.categoriaId,
          baseDuvidaId: resultado.baseDuvidaId,
          correta: resultado.correta,
        },
      ]);
      tocarSomResposta(resultado.correta);
    } catch (erro) {
      setMensagemErro((erro as Error).message || "Erro ao enviar a resposta.");
    } finally {
      setEnviando(false);
    }
  };

  const proximaPergunta = () => {
    if (!perguntaAtual || !resultadoResposta) return;

    if (indiceAtual < totalPerguntas - 1) {
      setIndiceAtual((atual) => atual + 1);
      setAlternativaSelecionadaId(null);
      setResultadoResposta(null);
      return;
    }

    void finalizarQuiz();
  };

  const finalizarQuiz = async () => {
    setQuizFinalizado(true);
    setCarregandoResultado(true);
    try {
      const resultado = await buscarResultadoDaPartida(partida!.partidaId);
      setResultadoFinal(resultado);
      tocarSomFinalizacao(resultado.aproveitamentoPositivo);
    } catch {
      tocarSomFinalizacao(acertos / totalPerguntas > 0.5);
    } finally {
      setCarregandoResultado(false);
    }
  };

  const jogarNovamente = async () => {
    setEnviando(true);
    setMensagemErro(null);
    try {
      const novaPartida = await repetirPartida(partida.partidaId);
      setPartida(novaPartida);
      setIndiceAtual(0);
      setAlternativaSelecionadaId(null);
      setResultadoResposta(null);
      setRespostasDadas([]);
      setResultadoFinal(null);
      setQuizFinalizado(false);
    } catch (erro) {
      setMensagemErro((erro as Error).message || "Erro ao reiniciar o quiz.");
    } finally {
      setEnviando(false);
    }
  };

  if (quizFinalizado) {
    const acertosFinais = resultadoFinal?.acertos ?? acertos;
    const percentualAcerto = resultadoFinal?.percentualAcerto ?? Math.round((acertos / totalPerguntas) * 100);
    const aproveitamentoPositivo = resultadoFinal?.aproveitamentoPositivo ?? acertos / totalPerguntas > 0.5;
    const itensFinais = resultadoFinal
      ? resultadoFinal.itens.map((item) => ({ ...item, correta: item.correta === true }))
      : respostasDadas;
    return (
      <div className="container py-4">
        <div className="quiz-jogo-card quiz-resultado">
          <img src="/mascote-fe.svg" alt="Mascote Fê" className="quiz-resultado-mascote" />
          <div className="eyebrow eyebrow-laranja mb-2">QUIZ CONCLUÍDO</div>
          <h2 className="quiz-resultado-titulo mb-2">
            {acertosFinais} de {totalPerguntas}
          </h2>
          <p className="quiz-resultado-percentual mb-4">
            Você acertou {percentualAcerto}% das perguntas.{" "}
            {aproveitamentoPositivo ? "Muito bem!" : "Tente novamente para melhorar seu resultado."}
          </p>

          {carregandoResultado && (
            <div className="mb-4">
              <AreaCarregando mensagem="Conferindo o resultado..." />
            </div>
          )}

          <div className="quiz-resumo-lista mb-4">
            {itensFinais.map((resposta) => (
              <div className="quiz-resumo-item" key={resposta.duvidaId}>
                <span className={`quiz-resumo-marca ${resposta.correta ? "certa" : "errada"}`}>
                  {resposta.correta ? "✓" : "✗"}
                </span>
                <span className="quiz-resumo-texto">{resposta.duvidaPergunta}</span>
                {!resposta.correta && (
                  <Link
                    to={`/categoria/${resposta.categoriaId}?duvida=${resposta.baseDuvidaId}`}
                    className="quiz-resumo-link"
                  >
                    Reler dúvida
                  </Link>
                )}
              </div>
            ))}
          </div>

          {mensagemErro && (
            <div className="mb-3">
              <Alerta mensagem={mensagemErro} />
            </div>
          )}

          <div className="quiz-resultado-acoes">
            <button type="button" className="quiz-botao-iniciar" onClick={jogarNovamente} disabled={enviando}>
              {enviando ? (
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              ) : (
                <i className="bi bi-arrow-repeat me-2" aria-hidden="true" />
              )}
              Jogar de novo
            </button>
            <Link to="/" className="quiz-botao-secundario text-decoration-none">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="quiz-jogo-card">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <span className="quiz-paginacao">
            PERGUNTA {indiceAtual + 1} DE {totalPerguntas}
          </span>
          <span className="quiz-tag quiz-tag-secundario">{perguntaAtual.categoriaNome}</span>
        </div>

        <div className="quiz-progresso-wrap mb-4">
          <div className="quiz-progresso" style={{ width: `${progresso}%` }} />
        </div>

        <h2 className="quiz-pergunta mb-4">{perguntaAtual.duvidaPergunta}</h2>

        <div className="quiz-opcoes-resposta" role="group" aria-label="Opções de resposta">
          {perguntaAtual.opcoesResposta.map((opcao, indiceOpcao) => {
            const selecionada = alternativaSelecionadaId === opcao.alternativaId;
            const eACorreta = resultadoResposta?.alternativaCorretaId === opcao.alternativaId;
            const classeFeedback = !resultadoResposta
              ? ""
              : eACorreta
                ? "certa"
                : selecionada
                  ? "errada"
                  : "";

            return (
              <button
                type="button"
                key={`${perguntaAtual.duvidaId}-${opcao.alternativaId}`}
                className={`quiz-opcao-resposta ${classeDaAlternativa(indiceOpcao)} ${classeFeedback}`}
                onClick={() => selecionarOpcao(opcao.alternativaId)}
                disabled={Boolean(resultadoResposta) || enviando}
              >
                <span className="quiz-opcao-resposta-letra">
                  {String.fromCharCode(65 + indiceOpcao)}
                </span>
                <span>{opcao.texto}</span>
                {resultadoResposta && selecionada && !eACorreta && (
                  <small className="quiz-opcao-rotulo">sua resposta</small>
                )}
                {resultadoResposta && eACorreta && (
                  <small className="quiz-opcao-rotulo">
                    {selecionada ? "sua resposta" : "correta"}
                  </small>
                )}
                {resultadoResposta && eACorreta && <i className="bi bi-check-circle" aria-hidden="true" />}
                {resultadoResposta && selecionada && !eACorreta && (
                  <i className="bi bi-x-circle" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {mensagemErro && (
          <div className="mt-3">
            <Alerta mensagem={mensagemErro} />
          </div>
        )}

        {resultadoResposta && (
          <>
            <div
              className={`quiz-feedback quiz-feedback-${resultadoResposta.correta ? "certa" : "errada"}`}
              role="status"
            >
              <i
                className={`bi ${resultadoResposta.correta ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
                aria-hidden="true"
              />
              <strong>{resultadoResposta.correta ? "Você acertou!" : "Não foi dessa vez."}</strong>
            </div>

            <div className="quiz-resposta-revelada mt-3">
              <div className="quiz-resposta-revelada-eyebrow">EXPLICAÇÃO</div>
              {resultadoResposta.explicacao}
            </div>

            <div className="mt-3">
              <Link
                to={`/categoria/${perguntaAtual.categoriaId}?duvida=${resultadoResposta.baseDuvidaId}`}
                className="link-limpar"
              >
                Ler a dúvida completa
              </Link>
            </div>

            <button type="button" className="quiz-botao-iniciar quiz-botao-proxima" onClick={proximaPergunta}>
              {indiceAtual < totalPerguntas - 1 ? "Próxima pergunta" : "Ver resultado"}
              <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
