import { describe, expect, it, vi } from "vitest";
import { respostaJson } from "../../../testes/respostas";
import { buscarResultadoDaPartida, iniciarPartida, repetirPartida, responderPergunta } from "./quizApi";

function simularFetch(resposta: Response) {
  const fetchFalso = vi.fn().mockResolvedValue(resposta);
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

describe("quizApi", () => {
  it("iniciarPartida envia a configuração e devolve a partida", async () => {
    const fetchFalso = simularFetch(respostaJson({ partidaId: 7, perguntas: [] }, 201));
    const configuracao = { modo: "categoria" as const, categorias: ["prazos"], quantidade: 3 };

    expect(await iniciarPartida(configuracao)).toEqual({ partidaId: 7, perguntas: [] });
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/quiz/partidas");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify(configuracao));
  });

  it("repetirPartida pede uma nova partida com as mesmas perguntas", async () => {
    const fetchFalso = simularFetch(respostaJson({ partidaId: 8, perguntas: [] }, 201));

    await repetirPartida(7);

    expect(fetchFalso.mock.calls[0][0]).toBe("/api/quiz/partidas");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify({ repetirPartidaId: 7 }));
  });

  it("responderPergunta envia a pergunta e a alternativa para a partida certa", async () => {
    const fetchFalso = simularFetch(respostaJson({ correta: true, alternativaCorretaId: 102, explicacao: "x", baseDuvidaId: "eleg-1" }));

    const resultado = await responderPergunta(7, "eleg-1", 102);

    expect(resultado.correta).toBe(true);
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/quiz/partidas/7/respostas");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify({ perguntaId: "eleg-1", alternativaId: 102 }));
  });

  it("responderPergunta lança o erro quando a resposta é recusada", async () => {
    simularFetch(respostaJson({ type: "conflict", code: "RespostaDuplicada", message: "Esta pergunta já foi respondida." }, 409));

    await expect(responderPergunta(7, "eleg-1", 102)).rejects.toMatchObject({ status: 409, codigo: "RespostaDuplicada" });
  });

  it("buscarResultadoDaPartida consulta o resultado da partida", async () => {
    const fetchFalso = simularFetch(respostaJson({ partidaId: 7, acertos: 2 }));

    expect(await buscarResultadoDaPartida(7)).toEqual({ partidaId: 7, acertos: 2 });
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/quiz/partidas/7/resultado");
  });
});
