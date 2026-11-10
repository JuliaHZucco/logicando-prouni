import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useSalaAoVivo } from "../../funcionalidades/salas/hooks/useSalaAoVivo";
import type { EstadoSala } from "../../funcionalidades/salas/tipos";
import { ErroApi } from "../../utilitarios/api";
import { criarEstado, criarPergunta, criarResultado } from "../../testes/fabricas";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaModeradorSala from "./PaginaModeradorSala";

vi.mock("../../funcionalidades/salas/hooks/useSalaAoVivo", () => ({ useSalaAoVivo: vi.fn() }));

type RetornoDoHook = ReturnType<typeof useSalaAoVivo>;

function simular(estado: EstadoSala | null, extras: Partial<RetornoDoHook> = {}) {
  const executar = vi.fn().mockResolvedValue({ ok: true });
  vi.mocked(useSalaAoVivo).mockReturnValue({
    estado,
    erroDeCarga: null,
    mensagemDeConexao: null,
    recarregarEstado: vi.fn(),
    responder: vi.fn(),
    executar,
    ...extras,
  } as RetornoDoHook);
  return executar;
}

const moderador = (parcial: Partial<EstadoSala> = {}) => criarEstado({ souModerador: true, participante: null, ...parcial });

function renderizar(entrada = "/moderador/sala/ABC123") {
  return renderizarComRotas(entrada, {
    "/moderador/sala/:codigo": <PaginaModeradorSala />,
    "/moderador/salas": <div>Minhas salas</div>,
  });
}

describe("PaginaModeradorSala", () => {
  it("mostra 'Abrindo a sala...' enquanto o estado não chega", () => {
    simular(null);
    renderizar();

    expect(screen.getByText("Abrindo a sala...")).toBeInTheDocument();
  });

  it("consulta a sala pelo código em maiúsculas", () => {
    simular(null);
    renderizar("/moderador/sala/abc123");

    expect(useSalaAoVivo).toHaveBeenCalledWith("ABC123");
  });

  it.each([403, 404])("volta para as salas quando a API responde %i", (status) => {
    simular(null, { erroDeCarga: new ErroApi({ status, codigo: "ERRO_HTTP", tipo: "error", mensagem: "Falhou." }) });
    renderizar();

    expect(screen.getByText("Minhas salas")).toBeInTheDocument();
  });

  it("quem não é o moderador da sala é mandado de volta para as salas", () => {
    simular(criarEstado({ souModerador: false }));
    renderizar();

    expect(screen.getByText("Minhas salas")).toBeInTheDocument();
  });

  it("na espera mostra o código e o botão de iniciar", () => {
    simular(moderador({ status: "aguardando" }));
    renderizar();

    expect(screen.getByRole("button", { name: "Iniciar partida" })).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("com a pergunta aberta mostra o controle da pergunta", () => {
    simular(moderador({ status: "pergunta_aberta", pergunta: criarPergunta() }));
    renderizar();

    expect(screen.getByRole("button", { name: "Encerrar pergunta agora" })).toBeInTheDocument();
  });

  it("com o resultado mostra o gráfico e o botão da próxima pergunta", () => {
    simular(moderador({ status: "resultado_pergunta", pergunta: criarPergunta(), resultado: criarResultado() }));
    renderizar();

    expect(screen.getByRole("button", { name: "Próxima pergunta" })).toBeInTheDocument();
  });

  it("no ranking mostra o pódio e a opção de jogar novamente", () => {
    simular(moderador({ status: "ranking", ranking: [] }));
    renderizar();

    expect(screen.getByRole("button", { name: "Jogar novamente" })).toBeInTheDocument();
  });

  it("com a sala encerrada mostra o resumo", () => {
    simular(moderador({ status: "encerrada", ranking: [] }));
    renderizar();

    expect(screen.getByRole("heading", { name: "Sala encerrada" })).toBeInTheDocument();
  });

  it("os botões chamam a ação certa no servidor", async () => {
    const executar = simular(moderador({ status: "aguardando" }));
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: "Iniciar partida" }));

    expect(executar).toHaveBeenCalledExactlyOnceWith("Avancar");
  });

  it("mostra o motivo quando o servidor recusa a ação", async () => {
    const executar = simular(moderador({ status: "aguardando" }));
    executar.mockResolvedValue({ ok: false, erro: "A sala não pode avançar agora." });
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: "Iniciar partida" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("A sala não pode avançar agora.");
  });

  it("usa uma mensagem padrão quando a recusa vem sem texto", async () => {
    const executar = simular(moderador({ status: "aguardando" }));
    executar.mockResolvedValue({ ok: false });
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: "Iniciar partida" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível concluir a ação.");
  });

  it("mostra o aviso quando a conexão com a sala falha", () => {
    simular(moderador({ status: "aguardando" }), { mensagemDeConexao: "Não foi possível conectar à sala." });
    renderizar();

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível conectar à sala.");
  });

  it("pede confirmação antes de encerrar a sala e permite cancelar", async () => {
    const executar = simular(moderador({ status: "aguardando" }));
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: "Encerrar sala" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Encerrar a sala ABC123?");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(executar).not.toHaveBeenCalled();
  });

  it("encerra a sala quando a pessoa confirma e fecha a janela", async () => {
    const executar = simular(moderador({ status: "aguardando" }));
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: "Encerrar sala" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Encerrar sala" }));

    expect(executar).toHaveBeenCalledExactlyOnceWith("EncerrarSala");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
