import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import AreaCarregando from "../../componentes/AreaCarregando";
import { listarMinhasSalas } from "../../funcionalidades/moderador/servicos/moderadorApi";
import type { EstadoFiltravel, FiltrosDeSalas, SalaResumo } from "../../funcionalidades/moderador/tipos";

const filtrosVazios: FiltrosDeSalas = { busca: "", estado: "", de: "", ate: "" };

const opcoesDeEstado: { valor: EstadoFiltravel; texto: string }[] = [
  { valor: "", texto: "Todos" },
  { valor: "aguardando", texto: "Aguardando" },
  { valor: "em_andamento", texto: "Em andamento" },
  { valor: "encerrada", texto: "Encerrada" },
];

function descreverEstado(status: string): { texto: string; classe: string } {
  if (status === "aguardando") return { texto: "Aguardando", classe: "aguardando" };
  if (status === "encerrada") return { texto: "Encerrada", classe: "encerrada" };
  return { texto: "Em andamento", classe: "andamento" };
}

function descreverModo(sala: SalaResumo): string {
  const perguntas = `${sala.quantidade} ${sala.quantidade === 1 ? "pergunta" : "perguntas"}`;
  if (sala.modo === "aleatorio") return `Aleatório · ${perguntas}`;
  if (sala.modo === "categoria") return `${sala.categorias[0] ?? "Uma categoria"} · ${perguntas}`;
  return `Misto (${sala.categorias.length} categorias) · ${perguntas}`;
}

function formatarData(dataIso: string): string {
  return new Date(dataIso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function PaginaModeradorSalas() {
  const [filtros, setFiltros] = useState<FiltrosDeSalas>(filtrosVazios);
  const [salas, setSalas] = useState<SalaResumo[] | null>(null);
  const [totalSemFiltros, setTotalSemFiltros] = useState(0);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    const esperar = setTimeout(() => {
      listarMinhasSalas(filtros)
        .then((resultado) => {
          if (cancelado) return;
          setSalas(resultado);
          setMensagemErro(null);
          if (!filtros.busca && !filtros.estado && !filtros.de && !filtros.ate) setTotalSemFiltros(resultado.length);
        })
        .catch((erro: Error) => {
          if (!cancelado) setMensagemErro(erro.message || "Erro ao carregar as salas.");
        });
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(esperar);
    };
  }, [filtros]);

  const alterarFiltro = <Campo extends keyof FiltrosDeSalas>(campo: Campo, valor: FiltrosDeSalas[Campo]) =>
    setFiltros((atuais) => ({ ...atuais, [campo]: valor }));

  const temFiltro = Boolean(filtros.busca || filtros.estado || filtros.de || filtros.ate);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <div className="eyebrow eyebrow-cinza mb-1">QUIZ AO VIVO</div>
          <h1 className="titulo-secao mb-0">Minhas salas</h1>
        </div>
        <Link to="/moderador/salas/nova" className="quiz-botao-iniciar text-decoration-none">
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />
          Criar sala
        </Link>
      </div>

      <section className="quiz-config-card mb-3" aria-label="Filtros">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label quiz-label" htmlFor="busca">
              BUSCAR PELO NOME
            </label>
            <input
              id="busca"
              type="search"
              className="form-control quiz-input"
              placeholder="Nome da sala ou código"
              value={filtros.busca}
              onChange={(evento) => alterarFiltro("busca", evento.target.value)}
            />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label quiz-label" htmlFor="estado">
              STATUS
            </label>
            <select
              id="estado"
              className="form-select quiz-input"
              value={filtros.estado}
              onChange={(evento) => alterarFiltro("estado", evento.target.value as EstadoFiltravel)}
            >
              {opcoesDeEstado.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.texto}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label quiz-label" htmlFor="de">
              CRIADA DE
            </label>
            <input
              id="de"
              type="date"
              className="form-control quiz-input"
              value={filtros.de}
              onChange={(evento) => alterarFiltro("de", evento.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label quiz-label" htmlFor="ate">
              ATÉ
            </label>
            <input
              id="ate"
              type="date"
              className="form-control quiz-input"
              value={filtros.ate}
              onChange={(evento) => alterarFiltro("ate", evento.target.value)}
            />
          </div>
          <div className="col-12 col-md-2">
            <button
              type="button"
              className="quiz-botao-secundario w-100"
              onClick={() => setFiltros(filtrosVazios)}
              disabled={!temFiltro}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </section>

      {mensagemErro && <Alerta mensagem={mensagemErro} />}

      {!salas && !mensagemErro && <AreaCarregando mensagem="Carregando salas..." />}

      {salas && (
        <section className="sala-cartao tabela-salas-cartao p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table tabela-salas mb-0 align-middle">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>CÓDIGO</th>
                  <th>STATUS</th>
                  <th>MODO</th>
                  <th>PARTICIPANTES</th>
                  <th>CRIADA EM</th>
                  <th className="text-end">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => {
                  const estado = descreverEstado(sala.status);
                  return (
                    <tr key={sala.codigo}>
                      <td className="fw-bold">{sala.nome}</td>
                      <td className="tabela-salas-codigo">{sala.codigo}</td>
                      <td>
                        <span className={`selo-estado selo-estado-${estado.classe}`}>{estado.texto}</span>
                      </td>
                      <td>{descreverModo(sala)}</td>
                      <td>{sala.participantes}</td>
                      <td>{formatarData(sala.criadaEm)}</td>
                      <td className="text-end">
                        <Link to={`/moderador/sala/${sala.codigo}`} className="link-limpar">
                          {sala.status === "encerrada" ? "Ver resultado" : "Abrir sala"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {salas.length === 0 && (
            <div className="p-4 text-center text-muted">Nenhuma sala encontrada com esses filtros.</div>
          )}
        </section>
      )}

      {salas && (
        <div className="text-muted small mt-2">
          {salas.length} de {Math.max(totalSemFiltros, salas.length)} {totalSemFiltros === 1 ? "sala" : "salas"}
        </div>
      )}
    </div>
  );
}
