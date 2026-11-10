import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVisualizacoes } from "../hooks/useVisualizacoes";
import { buscarDuvidasVistas, registrarDuvidaVista } from "../servicos/conteudoApi";
import ProvedorVisualizacoes from "./ProvedorVisualizacoes";

vi.mock("../hooks/useConteudo", () => ({ useConteudo: () => ({ totalGeralDuvidas: 71 }) }));
vi.mock("../servicos/conteudoApi", () => ({
  buscarDuvidasVistas: vi.fn(),
  registrarDuvidaVista: vi.fn(),
}));

function Provedor({ children }: { children: ReactNode }) {
  return <ProvedorVisualizacoes>{children}</ProvedorVisualizacoes>;
}

describe("ProvedorVisualizacoes", () => {
  beforeEach(() => {
    vi.mocked(buscarDuvidasVistas).mockResolvedValue([]);
    vi.mocked(registrarDuvidaVista).mockResolvedValue(undefined);
  });

  it("carrega do servidor as dúvidas que o visitante já viu", async () => {
    vi.mocked(buscarDuvidasVistas).mockResolvedValue(["eleg-1", "eleg-2"]);

    const { result } = renderHook(() => useVisualizacoes(), { wrapper: Provedor });

    await waitFor(() => expect(result.current.totalDuvidasVistas).toBe(2));
    expect(result.current.duvidaIdsVistas.has("eleg-1")).toBe(true);
  });

  it("expõe o total geral de dúvidas do conteúdo", () => {
    const { result } = renderHook(() => useVisualizacoes(), { wrapper: Provedor });

    expect(result.current.totalGeralDuvidas).toBe(71);
  });

  it("marca uma dúvida nova como vista e registra no servidor uma única vez", async () => {
    const { result } = renderHook(() => useVisualizacoes(), { wrapper: Provedor });
    await waitFor(() => expect(buscarDuvidasVistas).toHaveBeenCalled());

    act(() => {
      result.current.marcarDuvidaComoVista("prazos-1");
      result.current.marcarDuvidaComoVista("prazos-1");
    });

    expect(result.current.totalDuvidasVistas).toBe(1);
    expect(registrarDuvidaVista).toHaveBeenCalledExactlyOnceWith("prazos-1");
  });

  it("não registra de novo uma dúvida que o servidor já conhecia", async () => {
    vi.mocked(buscarDuvidasVistas).mockResolvedValue(["eleg-1"]);
    const { result } = renderHook(() => useVisualizacoes(), { wrapper: Provedor });
    await waitFor(() => expect(result.current.totalDuvidasVistas).toBe(1));

    act(() => result.current.marcarDuvidaComoVista("eleg-1"));

    expect(registrarDuvidaVista).not.toHaveBeenCalled();
    expect(result.current.totalDuvidasVistas).toBe(1);
  });

  it("continua funcionando quando o servidor não responde ao carregar", async () => {
    vi.mocked(buscarDuvidasVistas).mockRejectedValue(new Error("sem rede"));

    const { result } = renderHook(() => useVisualizacoes(), { wrapper: Provedor });
    await waitFor(() => expect(buscarDuvidasVistas).toHaveBeenCalled());

    expect(result.current.totalDuvidasVistas).toBe(0);
  });

  it("não perde a contagem quando o registro no servidor falha", async () => {
    vi.mocked(registrarDuvidaVista).mockRejectedValue(new Error("sem rede"));
    const { result } = renderHook(() => useVisualizacoes(), { wrapper: Provedor });
    await waitFor(() => expect(buscarDuvidasVistas).toHaveBeenCalled());

    act(() => result.current.marcarDuvidaComoVista("prazos-1"));

    expect(result.current.totalDuvidasVistas).toBe(1);
  });

  it("conta quantas dúvidas de uma categoria já foram vistas", async () => {
    vi.mocked(buscarDuvidasVistas).mockResolvedValue(["eleg-1", "prazos-1"]);
    const { result } = renderHook(() => useVisualizacoes(), { wrapper: Provedor });
    await waitFor(() => expect(result.current.totalDuvidasVistas).toBe(2));

    expect(result.current.contarDuvidasVistasNaCategoria(["eleg-1", "eleg-2", "eleg-3"])).toBe(1);
    expect(result.current.contarDuvidasVistasNaCategoria([])).toBe(0);
  });
});

describe("useVisualizacoes", () => {
  it("falha com uma mensagem clara quando usado fora do provedor", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderHook(() => useVisualizacoes())).toThrow("useVisualizacoes deve ser usado dentro de ProvedorVisualizacoes");
  });
});
