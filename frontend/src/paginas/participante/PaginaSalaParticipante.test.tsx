import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSalaAoVivo } from "../../funcionalidades/salas/hooks/useSalaAoVivo";
import type { EstadoSala } from "../../funcionalidades/salas/tipos";
import { ErroApi } from "../../utilitarios/api";
import { criarEstado, criarPergunta, criarResultado } from "../../testes/fabricas";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaSalaParticipante from "./PaginaSalaParticipante";

vi.mock("../../funcionalidades/salas/hooks/useSalaAoVivo", () => ({ useSalaAoVivo: vi.fn() }));
vi.mock("../../funcionalidades/salas/hooks/useSonsDaSala", () => ({ useSonsDaSala: vi.fn() }));

type RetornoDoHook = ReturnType<typeof useSalaAoVivo>;

function simular(estado: EstadoSala | null, extras: Partial<RetornoDoHook> = {}) {
  const responder = vi.fn().mockResolvedValue({ ok: true });
  vi.mocked(useSalaAoVivo).mockReturnValue({
    estado,
    erroDeCarga: null,
    mensagemDeConexao: null,
    recarregarEstado: vi.fn(),
    executar: vi.fn(),
    responder,
    ...extras,
  } as RetornoDoHook);
  return responder;
}

function renderizar(entrada = "/sala/ABC123") {
  return renderizarComRotas(entrada, {
    "/sala/:codigo": <PaginaSalaParticipante />,
    "/sala/:codigo/apelido": <div>Escolha o apelido</div>,
    "/quiz/sala": <div>Entrar em uma sala</div>,
    "/moderador/sala/:codigo": <div>Painel do moderador</div>,
  });
}

const erroDeApi = (status: number) => new ErroApi({ status, codigo: "ERRO_HTTP", tipo: "error", mensagem: "Falhou." });

describe("PaginaSalaParticipante", () => {
  it("mostra 'Entrando na sala...' enquanto o estado não chega", () => {
    simular(null);
    renderizar();

    expect(screen.getByText("Entrando na sala...")).toBeInTheDocument();
  });

  it("consulta a sala pelo código em maiúsculas", () => {
    simular(null);
    renderizar("/sala/abc123");

    expect(useSalaAoVivo).toHaveBeenCalledWith("ABC123");
  });

  it("sala inexistente leva de volta à entrada por código", () => {
    simular(null, { erroDeCarga: erroDeApi(404) });
    renderizar();

    expect(screen.getByText("Entrar em uma sala")).toBeInTheDocument();
  });

  it("quem ainda não é participante é levado a escolher o apelido", () => {
    simular(null, { erroDeCarga: erroDeApi(403) });
    renderizar();

    expect(screen.getByText("Escolha o apelido")).toBeInTheDocument();
  });

  it("o moderador que cair nesta tela vai para o painel dele", () => {
    simular(criarEstado({ participante: null, souModerador: true }));
    renderizar();

    expect(screen.getByText("Painel do moderador")).toBeInTheDocument();
  });

  it("mostra o código da sala e a inicial do apelido na barra", () => {
    simular(criarEstado({ participante: { id: 1, apelido: "ana" } }));
    renderizar();

    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
  });

  it("na espera mostra a tela de espera", () => {
    simular(criarEstado({ status: "aguardando" }));
    renderizar();

    expect(screen.getByRole("heading", { name: "Aguardando o moderador iniciar" })).toBeInTheDocument();
  });

  it("com a pergunta aberta mostra as alternativas e envia a resposta", async () => {
    const pergunta = criarPergunta();
    const responder = simular(criarEstado({ status: "pergunta_aberta", pergunta }));
    renderizar();

    screen.getByRole("button", { name: /Opção B/ }).click();

    expect(screen.getByRole("heading", { name: pergunta.enunciado })).toBeInTheDocument();
    await vi.waitFor(() => expect(responder).toHaveBeenCalledExactlyOnceWith(12));
  });

  it("com o resultado mostra se acertou", () => {
    simular(criarEstado({ status: "resultado_pergunta", minhaAlternativaId: 12, resultado: criarResultado() }));
    renderizar();

    expect(screen.getByRole("status")).toHaveTextContent("Você acertou!");
  });

  it("no ranking final mostra o pódio, sem o link de saída", () => {
    simular(criarEstado({ status: "ranking", ranking: [] }));
    renderizar();

    expect(screen.getByRole("heading", { name: "Ranking final" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Voltar ao site" })).not.toBeInTheDocument();
  });

  it("com a sala encerrada agradece e oferece voltar ao site", () => {
    simular(criarEstado({ status: "encerrada", ranking: [] }));
    renderizar();

    expect(screen.getByRole("heading", { name: "Obrigado por participar!" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao site" })).toHaveAttribute("href", "/");
  });

  it("mostra o aviso quando a conexão com a sala falha", () => {
    simular(criarEstado({ status: "aguardando" }), { mensagemDeConexao: "Não foi possível conectar à sala." });
    renderizar();

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível conectar à sala.");
  });
});
