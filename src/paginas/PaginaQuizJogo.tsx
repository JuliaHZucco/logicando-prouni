import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { registrarResultadoQuiz } from "../funcionalidades/duvidas/dados/historicoQuiz";

interface PerguntaQuiz {
  duvidaId: string;
  duvidaPergunta: string;
  duvidaResposta: string;
  categoriaNome?: string;
  categoriaId?: string;
  opcoesResposta: OpcaoResposta[];
}

interface OpcaoResposta {
  texto: string;
  correta: boolean;
}

interface EstadoQuiz {
  modo: "aleatorio" | "categoria" | "misto";
  categoriaSelecionada?: string;
  categoriasSelecionadas?: string[];
  quantidadePerguntas: number;
  perguntas: PerguntaQuiz[];
}

let audioQuizAtual: HTMLAudioElement | null = null;

function tocarAudioQuiz(caminho: string) {
  audioQuizAtual?.pause();
  audioQuizAtual = new Audio(caminho);
  audioQuizAtual.volume = 1;
  void audioQuizAtual.play().catch(() => undefined);
}

function tocarSomFinalizacao(aprovado: boolean) {
  const caminho = aprovado ? "/som-aproveitamento-alto.mp3" : "/som-aproveitamento-baixo.mp3";
  tocarAudioQuiz(caminho);
}

function tocarSomResposta(acertou: boolean) {
  const caminho = acertou ? "/som-acerto.mp3" : "/som-erro.mp3";
  tocarAudioQuiz(caminho);
}

export default function PaginaQuizJogo() {
  const location = useLocation();
  const navigate = useNavigate();
  const estadoQuiz = location.state as EstadoQuiz | null;

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [resultadoResposta, setResultadoResposta] = useState<"certa" | "errada" | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [quizFinalizado, setQuizFinalizado] = useState(false);

  const perguntas = estadoQuiz?.perguntas ?? [];
  const perguntaAtual = perguntas[indiceAtual];
  const totalPerguntas = perguntas.length;
  const categoriasExibidas =
    estadoQuiz?.modo === "misto" && estadoQuiz.categoriasSelecionadas?.length
      ? estadoQuiz.categoriasSelecionadas
      : perguntaAtual?.categoriaNome
        ? [perguntaAtual.categoriaNome]
        : [];

  const progresso = useMemo(() => {
    if (!totalPerguntas) return 0;
    const perguntasConcluidas = quizFinalizado ? totalPerguntas : indiceAtual;
    return (perguntasConcluidas / totalPerguntas) * 100;
  }, [totalPerguntas, indiceAtual, quizFinalizado]);

  if (!estadoQuiz?.perguntas?.length) {
    return <Navigate to="/quiz" replace />;
  }

  const selecionarOpcao = (indiceOpcao: number) => {
    if (!perguntaAtual || resultadoResposta) return;

    const acertou = perguntaAtual.opcoesResposta[indiceOpcao].correta;
    setOpcaoSelecionada(indiceOpcao);
    setResultadoResposta(acertou ? "certa" : "errada");
    registrarResultadoQuiz(perguntaAtual.duvidaId, acertou);
    void tocarSomResposta(acertou);

    if (acertou) {
      setAcertos((atual) => atual + 1);
    }
  };

  const proximaPergunta = () => {
    if (!perguntaAtual || !resultadoResposta) return;

    if (indiceAtual < totalPerguntas - 1) {
      setIndiceAtual((atual) => atual + 1);
      setOpcaoSelecionada(null);
      setResultadoResposta(null);
      return;
    }

    void tocarSomFinalizacao((acertos + (resultadoResposta === "certa" ? 1 : 0)) / totalPerguntas > 0.5);
    setQuizFinalizado(true);
  };

  const jogarNovamente = () => {
    setIndiceAtual(0);
    setOpcaoSelecionada(null);
    setResultadoResposta(null);
    setAcertos(0);
    setQuizFinalizado(false);
  };

  if (quizFinalizado) {
    const percentualAcerto = Math.round((acertos / totalPerguntas) * 100);
    return (
      <div className="container py-4">
        <div className="quiz-jogo-card quiz-resultado">
          <i className="bi bi-trophy quiz-resultado-icone" aria-hidden="true" />
          <div className="eyebrow eyebrow-laranja mb-2">QUIZ FINALIZADO</div>
          <h2 className="quiz-resultado-titulo mb-2">
            Você acertou {acertos} de {totalPerguntas}
          </h2>
          <p className="quiz-resultado-percentual mb-4">{percentualAcerto}% de aproveitamento</p>
          {percentualAcerto > 50 ? (
            <p className="quiz-resultado-mensagem mb-4">Parabéns pelo resultado!</p>
          ) : (
            <p className="quiz-resultado-mensagem mb-4">Tente novamente para melhorar seu resultado.</p>
          )}

          <div className="quiz-resultado-acoes">
            <button type="button" className="quiz-botao-iniciar" onClick={jogarNovamente}>
              <i className="bi bi-arrow-repeat me-2" aria-hidden="true" />
              Jogar novamente
            </button>
            <button
              type="button"
              className="quiz-botao-secundario"
              onClick={() => navigate("/quiz")}
            >
              Voltar ao menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="quiz-jogo-card">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <Link to="/quiz" className="link-voltar">
            <i className="bi bi-arrow-left me-2" aria-hidden="true" />
            Voltar
          </Link>

          <span className="quiz-paginacao">
            {indiceAtual + 1}/{totalPerguntas}
          </span>
        </div>

        <div className="quiz-progresso-wrap mb-4">
          <div className="quiz-progresso" style={{ width: `${progresso}%` }} />
        </div>

        <div className="quiz-jogo-topo mb-4">
          <span className="quiz-tag">Pergunta</span>
          {categoriasExibidas.map((categoria) => (
            <span className="quiz-tag quiz-tag-secundario" key={categoria}>
              {categoria}
            </span>
          ))}
        </div>

        <h2 className="quiz-pergunta mb-4">{perguntaAtual.duvidaPergunta}</h2>

        <div className="quiz-opcoes-resposta" role="group" aria-label="Opções de resposta">
          {perguntaAtual.opcoesResposta.map((opcao, indiceOpcao) => {
            const selecionada = opcaoSelecionada === indiceOpcao;
            const mostrarCorreta = resultadoResposta === "errada" && opcao.correta;
            const classeFeedback = selecionada
              ? resultadoResposta === "certa"
                ? "certa"
                : "errada"
              : mostrarCorreta
                ? "certa"
                : "";

            return (
              <button
                type="button"
                key={`${perguntaAtual.duvidaId}-${indiceOpcao}`}
                className={`quiz-opcao-resposta ${classeFeedback}`}
                onClick={() => selecionarOpcao(indiceOpcao)}
                disabled={Boolean(resultadoResposta)}
              >
                <span className="quiz-opcao-resposta-letra">
                  {String.fromCharCode(65 + indiceOpcao)}
                </span>
                <span>{opcao.texto}</span>
                {selecionada && (
                  <i
                    className={`bi ${resultadoResposta === "certa" ? "bi-check-circle" : "bi-x-circle"}`}
                    aria-hidden="true"
                  />
                )}
                {mostrarCorreta && <i className="bi bi-check-circle" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {resultadoResposta && (
          <div className={`quiz-feedback quiz-feedback-${resultadoResposta}`} role="status">
            <i
              className={`bi ${resultadoResposta === "certa" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
              aria-hidden="true"
            />
            <strong>{resultadoResposta === "certa" ? "Resposta correta!" : "Resposta incorreta"}</strong>
            <span>
              {resultadoResposta === "certa"
                ? "Muito bem, você está no caminho certo."
                : "A alternativa correta está destacada em verde."}
            </span>
          </div>
        )}

        {resultadoResposta && (
          <button type="button" className="quiz-botao-iniciar quiz-botao-proxima" onClick={proximaPergunta}>
            {indiceAtual < totalPerguntas - 1 ? "Próxima pergunta" : "Ver resultado"}
            <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
