import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatarTempo, useContagemRegressiva } from "./useContagemRegressiva";

describe("formatarTempo", () => {
  it("formata segundos como minutos e segundos", () => {
    expect(formatarTempo(0)).toBe("0:00");
    expect(formatarTempo(9)).toBe("0:09");
    expect(formatarTempo(60)).toBe("1:00");
    expect(formatarTempo(75)).toBe("1:15");
  });
});

describe("useContagemRegressiva", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("devolve nulo quando a pergunta não tem cronômetro", () => {
    const { result } = renderHook(() => useContagemRegressiva(null, 1));

    expect(result.current).toBeNull();
  });

  it("começa nos segundos informados e diminui com o tempo", () => {
    const { result } = renderHook(() => useContagemRegressiva(10, 1));
    expect(result.current).toBe(10);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current).toBe(6);
  });

  it("para em zero e nunca fica negativo", () => {
    const { result } = renderHook(() => useContagemRegressiva(3, 1));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current).toBe(0);
  });

  it("reinicia a contagem quando a pergunta muda (chave nova)", () => {
    const { result, rerender } = renderHook(({ chave }) => useContagemRegressiva(10, chave), { initialProps: { chave: 1 } });
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(result.current).toBe(3);

    rerender({ chave: 2 });

    expect(result.current).toBe(10);
  });

  it("para de contar quando o componente é removido", () => {
    const { unmount } = renderHook(() => useContagemRegressiva(10, 1));

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
