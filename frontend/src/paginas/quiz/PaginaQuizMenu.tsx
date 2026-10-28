import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import { useConteudo } from "../../funcionalidades/duvidas/hooks/useConteudo";
import AbasQuiz from "../../funcionalidades/quiz/componentes/AbasQuiz";
import { iniciarPartida } from "../../funcionalidades/quiz/servicos/quizApi";
import { ajustarQuantidade } from "../../funcionalidades/quiz/utilitarios/quantidade";
import type { ModoQuiz } from "../../funcionalidades/quiz/tipos";

export default function PaginaQuizMenu() {
  const navigate = useNavigate();
  const { categorias } = useConteudo();
  const [modo, setModo] = useState<ModoQuiz>("aleatorio");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>(categorias[0].categoriaId);
  const [categoriasSelecionadasMisto, setCategoriasSelecionadasMisto] = useState<string[]>(
    categorias.map((categoria) => categoria.categoriaId),
  );
  const [quantidadePerguntas, setQuantidadePerguntas] = useState<number>(5);
  const [iniciando, setIniciando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const opcoesCategoria = useMemo(
    () =>
      categorias.map((categoria) => ({
        value: categoria.categoriaId,
        label: categoria.categoriaNome,
      })),
    [categorias],
  );

  const alternarCategoriaMisto = (categoriaId: string) => {
    setCategoriasSelecionadasMisto((atuais) => {
      const proximasCategorias = atuais.includes(categoriaId)
        ? atuais.filter((id) => id !== categoriaId)
        : [...atuais, categoriaId];
      setQuantidadePerguntas((quantidadeAtual) =>
        ajustarQuantidade(quantidadeAtual, Math.max(1, proximasCategorias.length)),
      );
      return proximasCategorias;
    });
  };

  const nenhumaCategoriaSelecionadaNoMisto = modo === "misto" && categoriasSelecionadasMisto.length === 0;
  const minimoPerguntas =
    modo === "misto" ? Math.max(1, categoriasSelecionadasMisto.length) : 1;

  const categoriasEnviadas =
    modo === "categoria" ? [categoriaSelecionada] : modo === "misto" ? categoriasSelecionadasMisto : [];

  const iniciarQuiz = async () => {
    const quantidade = Math.min(Math.max(quantidadePerguntas || minimoPerguntas, minimoPerguntas), 10);

    setIniciando(true);
    setMensagemErro(null);
    try {
      const partida = await iniciarPartida({ modo, categorias: categoriasEnviadas, quantidade });
      navigate("/quiz/jogar", { state: { partida } });
    } catch (erro) {
      setMensagemErro((erro as Error).message || "Erro ao iniciar o quiz.");
    } finally {
      setIniciando(false);
    }
  };

  const alterarQuantidadePerguntas = (incremento: number) => {
    setQuantidadePerguntas((quantidadeAtual) =>
      Math.min(Math.max(quantidadeAtual + incremento, minimoPerguntas), 10),
    );
  };

  return (
    <div className="container py-4">
      <div className="quiz-menu-wrap">
        <Link to="/" className="link-voltar mb-4 d-inline-flex align-items-center">
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Voltar ao início
        </Link>

        <div className="quiz-menu-header mb-4">
          <h1 className="quiz-menu-titulo mb-2">
            <span className="quiz-menu-titulo-icone" aria-hidden="true">
              <i className="bi bi-controller" />
            </span>
            <span>Quiz do Prouni</span>
          </h1>
          <p className="quiz-menu-subtitulo mb-0">Escolha como praticar</p>
        </div>

        <AbasQuiz abaAtiva="sozinho" />

        <div className="quiz-menu-grid">
          <button
            type="button"
            className={`quiz-opcao ${modo === "aleatorio" ? "ativa" : ""}`}
            onClick={() => setModo("aleatorio")}
            aria-pressed={modo === "aleatorio"}
          >
            <span className="quiz-opcao-icone">
              <i className="bi bi-shuffle" aria-hidden="true" />
            </span>
            <span>
              <strong>Modo aleatório</strong>
              <small>Responda perguntas de qualquer tema</small>
            </span>
          </button>

          <button
            type="button"
            className={`quiz-opcao ${modo === "categoria" ? "ativa" : ""}`}
            onClick={() => setModo("categoria")}
            aria-pressed={modo === "categoria"}
          >
            <span className="quiz-opcao-icone">
              <i className="bi bi-folder2-open" aria-hidden="true" />
            </span>
            <span>
              <strong>Uma categoria</strong>
              <small>Foque em um assunto específico</small>
            </span>
          </button>

          <button
            type="button"
            className={`quiz-opcao ${modo === "misto" ? "ativa" : ""}`}
            onClick={() => {
              setModo("misto");
              setQuantidadePerguntas((quantidadeAtual) =>
                ajustarQuantidade(quantidadeAtual, Math.max(1, categoriasSelecionadasMisto.length)),
              );
            }}
            aria-pressed={modo === "misto"}
          >
            <span className="quiz-opcao-icone">
              <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
            </span>
            <span>
              <strong>Misto</strong>
              <small>Selecione várias categorias ao mesmo tempo</small>
            </span>
          </button>
        </div>

        <div className={`quiz-config-card mt-4 ${modo === "aleatorio" ? "quiz-config-card-aleatorio" : ""}`}>
          <div className="row g-3 align-items-end">
            <div className={`col-12 ${modo !== "aleatorio" ? "col-md-6" : "quiz-config-quantidade"}`}>
              <label className="form-label quiz-label" htmlFor="quantidadePerguntas">
                Quantidade de perguntas
              </label>
              <div className="quiz-quantidade-controle">
                <button
                  type="button"
                  className="quiz-quantidade-botao"
                  onClick={() => alterarQuantidadePerguntas(-1)}
                  disabled={quantidadePerguntas <= minimoPerguntas}
                  aria-label="Diminuir quantidade de perguntas"
                >
                  <i className="bi bi-chevron-down" aria-hidden="true" />
                </button>
                <input
                  id="quantidadePerguntas"
                  type="number"
                  min={minimoPerguntas}
                  max={10}
                  value={quantidadePerguntas}
                  onChange={(event) => {
                    const valor = Number(event.target.value);
                    setQuantidadePerguntas(Math.min(Math.max(valor || minimoPerguntas, minimoPerguntas), 10));
                  }}
                  className="form-control quiz-input"
                />
                <button
                  type="button"
                  className="quiz-quantidade-botao"
                  onClick={() => alterarQuantidadePerguntas(1)}
                  disabled={quantidadePerguntas >= 10}
                  aria-label="Aumentar quantidade de perguntas"
                >
                  <i className="bi bi-chevron-up" aria-hidden="true" />
                </button>
              </div>
            </div>

            {modo === "categoria" && (
              <div className="col-12 col-md-6">
                <label className="form-label quiz-label" htmlFor="categoriaQuiz">
                  Selecionar categoria
                </label>
                <select
                  id="categoriaQuiz"
                  className="form-select quiz-input"
                  value={categoriaSelecionada}
                  onChange={(event) => setCategoriaSelecionada(event.target.value)}
                >
                  {opcoesCategoria.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {modo === "misto" && (
            <div className="mt-3">
              {categoriasSelecionadasMisto.length > 0 && (
                <small className="quiz-dica text-muted d-block mb-3">
                  {`No modo misto, o mínimo é uma pergunta por categoria escolhida (${categoriasSelecionadasMisto.length}).`}
                </small>
              )}
              <div className="quiz-misto-titulo">
                Categorias selecionadas ({categoriasSelecionadasMisto.length})
              </div>
              <div className="quiz-misto-lista">
                {categorias.map((categoria) => {
                  const selecionada = categoriasSelecionadasMisto.includes(categoria.categoriaId);
                  return (
                    <button
                      type="button"
                      key={categoria.categoriaId}
                      className={`quiz-misto-chip ${selecionada ? "selecionada" : ""}`}
                      onClick={() => alternarCategoriaMisto(categoria.categoriaId)}
                      aria-pressed={selecionada}
                    >
                      {selecionada && <i className="bi bi-check2 me-1" aria-hidden="true" />}
                      {categoria.categoriaNome}
                    </button>
                  );
                })}
              </div>
              {nenhumaCategoriaSelecionadaNoMisto && (
                <p className="quiz-misto-aviso mt-2 mb-0">
                  Selecione pelo menos uma categoria para iniciar o quiz.
                </p>
              )}
            </div>
          )}
        </div>

        {mensagemErro && (
          <div className="mt-3">
            <Alerta mensagem={mensagemErro} />
          </div>
        )}

        <div className="d-flex justify-content-center mt-4">
          <button
            type="button"
            className="quiz-botao-iniciar"
            onClick={iniciarQuiz}
            disabled={nenhumaCategoriaSelecionadaNoMisto || iniciando}
          >
            {iniciando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                Iniciando...
              </>
            ) : (
              "Iniciar quiz"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
