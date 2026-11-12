import { describe, expect, it, vi } from "vitest";
import { criarEstado } from "../../../testes/fabricas";
import { respostaJson } from "../../../testes/respostas";
import { buscarEstadoDaSala, entrarNaSala, sairDaSala } from "./salasApi";

function simularFetch(resposta: Response) {
  const fetchFalso = vi.fn().mockResolvedValue(resposta);
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

describe("salasApi", () => {
  it("entrarNaSala envia o apelido para a sala pelo código", async () => {
    const fetchFalso = simularFetch(respostaJson({ participante: { id: 1, apelido: "Ana" }, reconectado: false }, 201));

    const resultado = await entrarNaSala("ABC123", "Ana");

    expect(resultado.participante.apelido).toBe("Ana");
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas/ABC123/participantes");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify({ apelido: "Ana" }));
  });

  it("entrarNaSala lança o erro com o código quando a API pede o apelido", async () => {
    simularFetch(respostaJson({ type: "error", code: "PrecisaApelido", message: "Escolha um apelido de 1 a 20 caracteres." }, 400));

    await expect(entrarNaSala("ABC123", "")).rejects.toMatchObject({ status: 400, codigo: "PrecisaApelido" });
  });

  it("sairDaSala remove o participante pela rota DELETE", async () => {
    const fetchFalso = simularFetch(new Response(null, { status: 204 }));

    await expect(sairDaSala("ABC123")).resolves.toBeUndefined();

    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas/ABC123/participantes/eu");
    expect(fetchFalso.mock.calls[0][1].method).toBe("DELETE");
  });

  it("buscarEstadoDaSala consulta o estado pelo código", async () => {
    const fetchFalso = simularFetch(respostaJson(criarEstado()));

    const estado = await buscarEstadoDaSala("ABC123");

    expect(estado.codigo).toBe("ABC123");
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas/ABC123/estado");
  });

  it("buscarEstadoDaSala lança o erro quando a pessoa não tem acesso", async () => {
    simularFetch(respostaJson({ type: "forbidden", message: "Entre na sala pelo código primeiro." }, 403));

    await expect(buscarEstadoDaSala("ABC123")).rejects.toMatchObject({ status: 403 });
  });
});
