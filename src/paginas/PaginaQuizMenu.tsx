import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categorias } from "../funcionalidades/duvidas/dados/conteudo";
import { alternativasQuiz } from "../funcionalidades/duvidas/dados/alternativasQuiz.ts";
import { perguntasQuizDerivadas } from "../funcionalidades/duvidas/dados/perguntasQuizDerivadas";
import type { OpcaoQuiz } from "../funcionalidades/duvidas/tipos";

const perguntasOriginais = categorias.flatMap((categoria) =>
  categoria.categoriaDuvidas.map((duvida) => ({
    ...duvida,
    categoriaId: categoria.categoriaId,
    categoriaNome: categoria.categoriaNome,
  })),
);

const perguntasDerivadas = Object.entries(perguntasQuizDerivadas).flatMap(
  ([categoriaId, perguntas]) => {
    const categoria = categorias.find((item) => item.categoriaId === categoriaId);
    if (!categoria) return [];

    return perguntas.flatMap((pergunta) => {
      const duvidaBase = categoria.categoriaDuvidas.find(
        (duvida) => duvida.duvidaId === pergunta.baseDuvidaId,
      );
      if (!duvidaBase) return [];

      return {
        ...pergunta,
        duvidaResposta: duvidaBase.duvidaResposta,
        categoriaId,
        categoriaNome: categoria.categoriaNome,
      };
    });
  },
);

const todasAsPerguntas = [...perguntasOriginais, ...perguntasDerivadas];

function embaralhar<T>(itens: T[]): T[] {
  return [...itens].sort(() => Math.random() - 0.5);
}

function criarOpcoesResposta(perguntaId: string) {
  return embaralhar(alternativasQuiz[perguntaId] ?? []);
}

export default function PaginaQuizMenu() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"aleatorio" | "categoria" | "misto">("aleatorio");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>(categorias[0].categoriaId);
  const [categoriasSelecionadasMisto, setCategoriasSelecionadasMisto] = useState<string[]>(
    categorias.map((categoria) => categoria.categoriaId),
  );
  const [quantidadePerguntas, setQuantidadePerguntas] = useState<number>(5);

  const opcoesCategoria = useMemo(
    () =>
      categorias.map((categoria) => ({
        value: categoria.categoriaId,
        label: categoria.categoriaNome,
      })),
    [],
  );

  const alternarCategoriaMisto = (categoriaId: string) => {
    setCategoriasSelecionadasMisto((atuais) => {
      const proximasCategorias = atuais.includes(categoriaId)
        ? atuais.filter((id) => id !== categoriaId)
        : [...atuais, categoriaId];
      setQuantidadePerguntas((quantidadeAtual) =>
        Math.max(quantidadeAtual, Math.max(1, proximasCategorias.length)),
      );
      return proximasCategorias;
    });
  };

  const nenhumaCategoriaSelecionadaNoMisto = modo === "misto" && categoriasSelecionadasMisto.length === 0;
  const minimoPerguntas =
    modo === "misto" ? Math.max(1, categoriasSelecionadasMisto.length) : 1;

  const iniciarQuiz = () => {
    const quantidade = Math.min(Math.max(quantidadePerguntas || minimoPerguntas, minimoPerguntas), 10);

    const perguntas = (() => {
      if (modo === "categoria") {
        const perguntasDaCategoria = todasAsPerguntas.filter(
          (pergunta) => pergunta.categoriaId === categoriaSelecionada,
        );
        return embaralhar(perguntasDaCategoria).slice(0, quantidade);
      }

      if (modo === "misto") {
        const perguntasDasCategoriasSelecionadas = todasAsPerguntas.filter((pergunta) =>
          categoriasSelecionadasMisto.includes(pergunta.categoriaId),
        );
        return embaralhar(perguntasDasCategoriasSelecionadas).slice(0, quantidade);
      }

      return embaralhar(todasAsPerguntas).slice(0, quantidade);
    })();

    const perguntasComOpcoes = perguntas.map((pergunta) => ({
      ...pergunta,
      opcoesResposta:
        "opcoesResposta" in pergunta
          ? embaralhar((pergunta as { opcoesResposta: OpcaoQuiz[] }).opcoesResposta)
          : criarOpcoesResposta(pergunta.duvidaId),
    }));

    const estadoInicial = {
      modo,
      categoriaSelecionada,
      categoriasSelecionadas:
        modo === "misto"
          ? categorias
              .filter((categoria) => categoriasSelecionadasMisto.includes(categoria.categoriaId))
              .map((categoria) => categoria.categoriaNome)
          : [],
      quantidadePerguntas: quantidade,
      perguntas: perguntasComOpcoes,
    };

    navigate("/quiz/jogar", { state: estadoInicial });
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

        <div className="quiz-menu-grid">
          <button
            type="button"
            className={`quiz-opcao ${modo === "aleatorio" ? "ativa" : ""}`}
            onClick={() => setModo("aleatorio")}
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
                Math.max(quantidadeAtual, Math.max(1, categoriasSelecionadasMisto.length)),
              );
            }}
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

        <div className="d-flex justify-content-center mt-4">
          <button
            type="button"
            className="quiz-botao-iniciar"
            onClick={iniciarQuiz}
            disabled={nenhumaCategoriaSelecionadaNoMisto}
          >
            Iniciar quiz
          </button>
        </div>
      </div>
    </div>
  );
}
