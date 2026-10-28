import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import { useConteudo } from "../../funcionalidades/duvidas/hooks/useConteudo";
import LinkVoltarModerador from "../../funcionalidades/moderador/componentes/LinkVoltarModerador";
import { criarSala } from "../../funcionalidades/moderador/servicos/moderadorApi";
import { ajustarQuantidade } from "../../funcionalidades/quiz/utilitarios/quantidade";
import type { ModoQuiz } from "../../funcionalidades/quiz/tipos";

const modos: { valor: ModoQuiz; nome: string; descricao: string }[] = [
  { valor: "aleatorio", nome: "Modo aleatório", descricao: "Perguntas de qualquer tema" },
  { valor: "categoria", nome: "Uma categoria", descricao: "Foco em um assunto" },
  { valor: "misto", nome: "Misto", descricao: "Várias categorias ao mesmo tempo" },
];

export default function PaginaModeradorCriarSala() {
  const navigate = useNavigate();
  const { categorias } = useConteudo();
  const [nome, setNome] = useState("");
  const [modo, setModo] = useState<ModoQuiz>("aleatorio");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(categorias[0].categoriaId);
  const [categoriasDoMisto, setCategoriasDoMisto] = useState(categorias.map((categoria) => categoria.categoriaId));
  const [quantidade, setQuantidade] = useState(5);
  const [usaCronometro, setUsaCronometro] = useState(false);
  const [segundos, setSegundos] = useState(30);
  const [criando, setCriando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const minimoDePerguntas = modo === "misto" ? Math.max(1, categoriasDoMisto.length) : 1;
  const categoriasEnviadas =
    modo === "categoria" ? [categoriaSelecionada] : modo === "misto" ? categoriasDoMisto : [];

  const motivoDeBloqueio = (() => {
    if (!nome.trim()) return "Dê um nome à sala.";
    if (modo === "misto" && categoriasDoMisto.length === 0) return "Escolha ao menos uma categoria.";
    if (quantidade < minimoDePerguntas || quantidade > 10) return "Escolha de 1 a 10 perguntas.";
    if (usaCronometro && (!Number.isInteger(segundos) || segundos < 10 || segundos > 60)) {
      return "O cronômetro deve ter de 10 a 60 segundos.";
    }
    return null;
  })();

  const alterarCategoriaDoMisto = (categoriaId: string) => {
    const proximas = categoriasDoMisto.includes(categoriaId)
      ? categoriasDoMisto.filter((id) => id !== categoriaId)
      : [...categoriasDoMisto, categoriaId];
    setCategoriasDoMisto(proximas);
    setQuantidade((atual) => ajustarQuantidade(atual, Math.max(1, proximas.length)));
  };

  const alterarQuantidade = (incremento: number) =>
    setQuantidade((atual) => ajustarQuantidade(atual + incremento, minimoDePerguntas));

  const criar = async () => {
    setCriando(true);
    setMensagemErro(null);
    try {
      const { codigo } = await criarSala({
        nome: nome.trim(),
        modo,
        categorias: categoriasEnviadas,
        quantidade,
        segundosPorPergunta: usaCronometro ? segundos : null,
      });
      navigate(`/moderador/sala/${codigo}`);
    } catch (erro) {
      setMensagemErro((erro as Error).message || "Erro ao criar a sala.");
      setCriando(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="quiz-menu-wrap">
        <LinkVoltarModerador para="/moderador/salas" texto="Minhas salas" />
        <h1 className="titulo-secao mb-3">Criar sala</h1>

        <section className="quiz-config-card">
          <label className="form-label quiz-label" htmlFor="nomeDaSala">
            NOME DA SALA
          </label>
          <input
            id="nomeDaSala"
            type="text"
            maxLength={60}
            className="form-control quiz-input mb-4"
            placeholder="Ex.: Palestra Prouni · Turma A"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
          />

          <div className="quiz-label mb-2">MODO DAS PERGUNTAS</div>
          <div className="quiz-menu-grid mb-4">
            {modos.map((opcao) => (
              <button
                type="button"
                key={opcao.valor}
                className={`quiz-opcao ${modo === opcao.valor ? "ativa" : ""}`}
                aria-pressed={modo === opcao.valor}
                onClick={() => {
                  setModo(opcao.valor);
                  setQuantidade((atual) =>
                    ajustarQuantidade(atual, opcao.valor === "misto" ? Math.max(1, categoriasDoMisto.length) : 1),
                  );
                }}
              >
                <span>
                  <strong>{opcao.nome}</strong>
                  <small>{opcao.descricao}</small>
                </span>
              </button>
            ))}
          </div>

          {modo === "categoria" && (
            <div className="mb-4">
              <label className="form-label quiz-label" htmlFor="categoriaDaSala">
                CATEGORIA
              </label>
              <select
                id="categoriaDaSala"
                className="form-select quiz-input"
                value={categoriaSelecionada}
                onChange={(evento) => setCategoriaSelecionada(evento.target.value)}
              >
                {categorias.map((categoria) => (
                  <option key={categoria.categoriaId} value={categoria.categoriaId}>
                    {categoria.categoriaNome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {modo === "misto" && (
            <div className="mb-4">
              <div className="quiz-misto-titulo">CATEGORIAS SELECIONADAS ({categoriasDoMisto.length})</div>
              <div className="quiz-misto-lista">
                {categorias.map((categoria) => {
                  const selecionada = categoriasDoMisto.includes(categoria.categoriaId);
                  return (
                    <button
                      type="button"
                      key={categoria.categoriaId}
                      className={`quiz-misto-chip ${selecionada ? "selecionada" : ""}`}
                      aria-pressed={selecionada}
                      onClick={() => alterarCategoriaDoMisto(categoria.categoriaId)}
                    >
                      {selecionada && <i className="bi bi-check2 me-1" aria-hidden="true" />}
                      {categoria.categoriaNome}
                    </button>
                  );
                })}
              </div>
              {categoriasDoMisto.length === 0 && <p className="quiz-misto-aviso mt-2 mb-0">Escolha ao menos uma categoria.</p>}
            </div>
          )}

          <div className="quiz-label mb-2">NÚMERO DE PERGUNTAS (1 a 10)</div>
          <div className="quiz-quantidade-controle mb-4">
            <button
              type="button"
              className="quiz-quantidade-botao"
              onClick={() => alterarQuantidade(-1)}
              disabled={quantidade <= minimoDePerguntas}
              aria-label="Diminuir quantidade de perguntas"
            >
              <i className="bi bi-dash-lg" aria-hidden="true" />
            </button>
            <span className="quiz-quantidade-valor">{quantidade}</span>
            <button
              type="button"
              className="quiz-quantidade-botao"
              onClick={() => alterarQuantidade(1)}
              disabled={quantidade >= 10}
              aria-label="Aumentar quantidade de perguntas"
            >
              <i className="bi bi-plus-lg" aria-hidden="true" />
            </button>
          </div>

          <div className="quiz-label mb-2">TEMPO POR PERGUNTA</div>
          <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
            <div className="form-check mb-0">
              <input
                id="usaCronometro"
                type="checkbox"
                className="form-check-input"
                checked={usaCronometro}
                onChange={(evento) => setUsaCronometro(evento.target.checked)}
              />
              <label className="form-check-label" htmlFor="usaCronometro">
                Usar cronômetro
              </label>
            </div>
            {usaCronometro && (
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="segundosPorPergunta" className="mb-0">
                  Segundos (10 a 60):
                </label>
                <input
                  id="segundosPorPergunta"
                  type="number"
                  min={10}
                  max={60}
                  className="form-control quiz-input campo-segundos"
                  value={segundos}
                  onChange={(evento) => setSegundos(Number(evento.target.value))}
                />
              </div>
            )}
          </div>

          {mensagemErro && (
            <div className="mb-3">
              <Alerta mensagem={mensagemErro} />
            </div>
          )}

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              type="button"
              className="quiz-botao-iniciar"
              onClick={criar}
              disabled={Boolean(motivoDeBloqueio) || criando}
            >
              {criando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Criando...
                </>
              ) : (
                "Criar sala e gerar código"
              )}
            </button>
            {motivoDeBloqueio && nome.trim() && <span className="text-muted small">{motivoDeBloqueio}</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
