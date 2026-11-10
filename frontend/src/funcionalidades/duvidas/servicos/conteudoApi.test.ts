import { describe, expect, it, vi } from "vitest";
import { criarCategorias } from "../../../testes/fabricas";
import { respostaJson } from "../../../testes/respostas";
import { buscarConteudo, buscarDuvidasVistas, registrarDuvidaVista } from "./conteudoApi";

function simularFetch(resposta: Response) {
  const fetchFalso = vi.fn().mockResolvedValue(resposta);
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

describe("conteudoApi", () => {
  it("buscarConteudo devolve as categorias do site", async () => {
    const fetchFalso = simularFetch(respostaJson(criarCategorias()));

    const categorias = await buscarConteudo();

    expect(categorias).toHaveLength(3);
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/conteudo");
  });

  it("buscarConteudo lança o erro quando o servidor falha", async () => {
    simularFetch(respostaJson({ type: "error", message: "Erro interno do servidor." }, 500));

    await expect(buscarConteudo()).rejects.toMatchObject({ status: 500, message: "Erro interno do servidor." });
  });

  it("buscarDuvidasVistas devolve os identificadores já vistos", async () => {
    const fetchFalso = simularFetch(respostaJson(["eleg-1", "praz-1"]));

    expect(await buscarDuvidasVistas()).toEqual(["eleg-1", "praz-1"]);
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/duvidas-vistas");
  });

  it("registrarDuvidaVista envia o identificador da dúvida", async () => {
    const fetchFalso = simularFetch(respostaJson({ success: true }));

    await expect(registrarDuvidaVista("eleg-1")).resolves.toBeUndefined();
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/duvidas-vistas");
    expect(fetchFalso.mock.calls[0][1]).toMatchObject({ method: "POST", body: JSON.stringify({ duvidaId: "eleg-1" }) });
  });
});
