import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarEstado, criarPergunta, criarResultado } from "../../../testes/fabricas";
import { ErroApi } from "../../../utilitarios/api";
import { criarConexaoDaSala } from "../servicos/conexaoDaSala";
import { buscarEstadoDaSala } from "../servicos/salasApi";
import { useSalaAoVivo } from "./useSalaAoVivo";

vi.mock("../servicos/conexaoDaSala", () => ({ criarConexaoDaSala: vi.fn() }));
vi.mock("../servicos/salasApi", () => ({ buscarEstadoDaSala: vi.fn() }));

type Manipulador = (...argumentos: unknown[]) => unknown;

function criarConexaoFalsa() {
  const manipuladores = new Map<string, Manipulador>();
  const conexao = {
    on: vi.fn((evento: string, manipulador: Manipulador) => {
      manipuladores.set(evento, manipulador);
    }),
    onreconnected: vi.fn((manipulador: Manipulador) => {
      manipuladores.set("reconectado", manipulador);
    }),
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockResolvedValue({ ok: true }),
  };

  const emitir = async (evento: string, ...argumentos: unknown[]) => {
    await act(async () => {
      await manipuladores.get(evento)?.(...argumentos);
    });
  };

  return { conexao, emitir };
}

async function iniciar(codigo = "ABC123") {
  const falsa = criarConexaoFalsa();
  vi.mocked(criarConexaoDaSala).mockReturnValue(falsa.conexao as never);
  const hook = renderHook(() => useSalaAoVivo(codigo));
  await waitFor(() => expect(hook.result.current.estado).not.toBeNull());
  return { ...falsa, ...hook };
}

describe("useSalaAoVivo", () => {
  beforeEach(() => {
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado());
  });

  it("carrega o estado da sala, conecta e entra no canal da sala", async () => {
    const { conexao, result } = await iniciar("ABC123");

    await waitFor(() => expect(conexao.invoke).toHaveBeenCalledWith("EntrarSala", "ABC123"));
    expect(buscarEstadoDaSala).toHaveBeenCalledWith("ABC123");
    expect(conexao.start).toHaveBeenCalledOnce();
    expect(result.current.estado?.codigo).toBe("ABC123");
    expect(result.current.mensagemDeConexao).toBeNull();
  });

  it("guarda o erro quando o estado da sala não pode ser carregado", async () => {
    const erro = new ErroApi({ status: 403, codigo: "ERRO_HTTP", tipo: "forbidden", mensagem: "Entre na sala pelo código primeiro." });
    vi.mocked(buscarEstadoDaSala).mockRejectedValue(erro);
    const falsa = criarConexaoFalsa();
    vi.mocked(criarConexaoDaSala).mockReturnValue(falsa.conexao as never);

    const { result } = renderHook(() => useSalaAoVivo("ABC123"));

    await waitFor(() => expect(result.current.erroDeCarga).toBe(erro));
    expect(result.current.estado).toBeNull();
  });

  it("avisa quando o servidor recusa a entrada no canal da sala", async () => {
    const falsa = criarConexaoFalsa();
    falsa.conexao.invoke.mockResolvedValue({ ok: false, erro: "Sem acesso a esta sala." });
    vi.mocked(criarConexaoDaSala).mockReturnValue(falsa.conexao as never);

    const { result } = renderHook(() => useSalaAoVivo("ABC123"));

    await waitFor(() => expect(result.current.mensagemDeConexao).toBe("Sem acesso a esta sala."));
  });

  it("avisa quando não consegue conectar", async () => {
    const falsa = criarConexaoFalsa();
    falsa.conexao.start.mockRejectedValue(new Error("falhou"));
    vi.mocked(criarConexaoDaSala).mockReturnValue(falsa.conexao as never);

    const { result } = renderHook(() => useSalaAoVivo("ABC123"));

    await waitFor(() => expect(result.current.mensagemDeConexao).toBe("Não foi possível conectar à sala."));
  });

  it("atualiza a lista quando alguém entra na sala", async () => {
    const { emitir, result } = await iniciar();

    await emitir("participante-entrou", {
      participantes: [
        { id: 1, apelido: "Ana" },
        { id: 2, apelido: "Bruno" },
      ],
      total: 2,
    });

    expect(result.current.estado?.totalParticipantes).toBe(2);
    expect(result.current.estado?.participantes.map((x) => x.apelido)).toEqual(["Ana", "Bruno"]);
  });

  it("abre a pergunta quando o moderador avança e limpa a resposta e o resultado anteriores", async () => {
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(
      criarEstado({ status: "resultado_pergunta", minhaAlternativaId: 12, resultado: criarResultado() }),
    );
    const { emitir, result } = await iniciar();
    const pergunta = criarPergunta({ ordem: 2 });

    await emitir("pergunta-iniciada", pergunta);

    expect(result.current.estado?.status).toBe("pergunta_aberta");
    expect(result.current.estado?.pergunta).toEqual(pergunta);
    expect(result.current.estado?.perguntaAtual).toBe(2);
    expect(result.current.estado?.minhaAlternativaId).toBeNull();
    expect(result.current.estado?.resultado).toBeNull();
  });

  it("atualiza quantos já responderam", async () => {
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado({ status: "pergunta_aberta", pergunta: criarPergunta() }));
    const { emitir, result } = await iniciar();

    await emitir("resposta-registrada", { respondidas: 3, totalParticipantes: 5 });

    expect(result.current.estado?.pergunta?.respondidas).toBe(3);
    expect(result.current.estado?.totalParticipantes).toBe(5);
  });

  it("mostra o resultado quando a pergunta fecha", async () => {
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado({ status: "pergunta_aberta", pergunta: criarPergunta() }));
    const { emitir, result } = await iniciar();
    const resultado = criarResultado();

    await emitir("resultado-disponivel", resultado);

    expect(result.current.estado?.status).toBe("resultado_pergunta");
    expect(result.current.estado?.resultado).toEqual(resultado);
  });

  it.each(["quiz-finalizado", "nova-rodada"])("recarrega o estado no evento %s", async (evento) => {
    const { emitir } = await iniciar();
    expect(buscarEstadoDaSala).toHaveBeenCalledTimes(1);

    await emitir(evento, {});

    expect(buscarEstadoDaSala).toHaveBeenCalledTimes(2);
  });

  it("depois de reconectar entra de novo na sala e recarrega o estado", async () => {
    const { conexao, emitir } = await iniciar("ABC123");
    await waitFor(() => expect(conexao.invoke).toHaveBeenCalledTimes(1));

    await emitir("reconectado");

    expect(conexao.invoke).toHaveBeenCalledTimes(2);
    expect(conexao.invoke).toHaveBeenLastCalledWith("EntrarSala", "ABC123");
    expect(buscarEstadoDaSala).toHaveBeenCalledTimes(2);
  });

  it("responder chama o servidor e marca a alternativa quando ele aceita", async () => {
    const { conexao, result } = await iniciar("ABC123");
    await waitFor(() => expect(conexao.invoke).toHaveBeenCalledTimes(1));

    let resultado: unknown;
    await act(async () => {
      resultado = await result.current.responder(12);
    });

    expect(conexao.invoke).toHaveBeenLastCalledWith("Responder", "ABC123", 12);
    expect(resultado).toEqual({ ok: true });
    expect(result.current.estado?.minhaAlternativaId).toBe(12);
  });

  it("responder não marca a alternativa quando o servidor recusa", async () => {
    const { conexao, result } = await iniciar("ABC123");
    await waitFor(() => expect(conexao.invoke).toHaveBeenCalledTimes(1));
    conexao.invoke.mockResolvedValueOnce({ ok: false, erro: "O tempo desta pergunta acabou." });

    let resultado: unknown;
    await act(async () => {
      resultado = await result.current.responder(12);
    });

    expect(resultado).toEqual({ ok: false, erro: "O tempo desta pergunta acabou." });
    expect(result.current.estado?.minhaAlternativaId).toBeNull();
  });

  it("devolve falha de conexão quando a chamada ao servidor dá erro", async () => {
    const { conexao, result } = await iniciar("ABC123");
    await waitFor(() => expect(conexao.invoke).toHaveBeenCalledTimes(1));
    conexao.invoke.mockRejectedValueOnce(new Error("caiu"));

    let resultado: unknown;
    await act(async () => {
      resultado = await result.current.executar("Avancar");
    });

    expect(resultado).toEqual({ ok: false, erro: "Sem conexão com a sala." });
  });

  it("encerra a conexão quando a tela é fechada", async () => {
    const { conexao, unmount } = await iniciar();

    unmount();

    expect(conexao.stop).toHaveBeenCalledOnce();
  });
});
