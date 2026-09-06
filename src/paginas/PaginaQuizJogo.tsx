import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

function tocarSomFinalizacao() {
  const contexto = new AudioContext();
  const ganho = contexto.createGain();
  const agora = contexto.currentTime;
  const frequencias = [523.25, 659.25, 783.99];

  ganho.gain.setValueAtTime(0.0001, agora);
  ganho.gain.exponentialRampToValueAtTime(0.16, agora + 0.03);
  ganho.gain.exponentialRampToValueAtTime(0.0001, agora + 0.9);
  ganho.connect(contexto.destination);

  frequencias.forEach((frequencia, indice) => {
    const oscilador = contexto.createOscillator();
    const inicio = agora + indice * 0.16;
    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(frequencia, inicio);
    oscilador.connect(ganho);
    oscilador.start(inicio);
    oscilador.stop(inicio + 0.25);
  });

  window.setTimeout(() => void contexto.close(), 1100);
}

export default function PaginaQuizJogo() {
  const location = useLocation();
  const navigate = useNavigate();
  const estadoQuiz = (location.state as EstadoQuiz | null) ?? {
    modo: "aleatorio",
    quantidadePerguntas: 5,
    perguntas: [],
  };

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [resultadoResposta, setResultadoResposta] = useState<"certa" | "errada" | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [quizFinalizado, setQuizFinalizado] = useState(false);

  const perguntaAtual = estadoQuiz.perguntas[indiceAtual];
  const totalPerguntas = estadoQuiz.perguntas.length;
  const categoriasExibidas =
    estadoQuiz.modo === "misto" && estadoQuiz.categoriasSelecionadas?.length
      ? estadoQuiz.categoriasSelecionadas
      : perguntaAtual?.categoriaNome
        ? [perguntaAtual.categoriaNome]
        : [];

  const progresso = useMemo(() => {
    if (!totalPerguntas) return 0;
    const perguntasConcluidas = quizFinalizado ? totalPerguntas : indiceAtual;
    return (perguntasConcluidas / totalPerguntas) * 100;
  }, [totalPerguntas, indiceAtual, quizFinalizado]);

  const tocarSomResposta = (acertou: boolean) => {
    const contexto = new AudioContext();
    const oscilador = contexto.createOscillator();
    const ganho = contexto.createGain();
    const agora = contexto.currentTime;

    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(acertou ? 660 : 220, agora);
    ganho.gain.setValueAtTime(0.0001, agora);
    ganho.gain.exponentialRampToValueAtTime(0.18, agora + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + 0.35);
    oscilador.connect(ganho);
    ganho.connect(contexto.destination);
    oscilador.start(agora);
    oscilador.stop(agora + 0.35);
    window.setTimeout(() => void contexto.close(), 500);
  };

  const selecionarOpcao = (indiceOpcao: number) => {
    if (!perguntaAtual || resultadoResposta) return;

    const acertou = perguntaAtual.opcoesResposta[indiceOpcao].correta;
    setOpcaoSelecionada(indiceOpcao);
    setResultadoResposta(acertou ? "certa" : "errada");
    tocarSomResposta(acertou);

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

    tocarSomFinalizacao();
    setQuizFinalizado(true);
  };

  const jogarNovamente = () => {
    setIndiceAtual(0);
    setOpcaoSelecionada(null);
    setResultadoResposta(null);
    setAcertos(0);
    setQuizFinalizado(false);
  };

  if (!totalPerguntas) {
    return (
      <div className="container py-4">
        <div className="quiz-vazio">
          <i className="bi bi-emoji-frown quiz-vazio-icone" aria-hidden="true" />
          <h2 className="titulo-secao mb-2">Nenhuma pergunta disponível</h2>
          <p className="quiz-vazio-texto mb-4">
            Escolha um modo de jogo para começar a testar seus conhecimentos.
          </p>
          <Link to="/quiz" className="quiz-botao-iniciar">
            Voltar ao menu do quiz
          </Link>
        </div>
      </div>
    );
  }

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
