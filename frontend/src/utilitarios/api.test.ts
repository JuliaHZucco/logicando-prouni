import { describe, expect, it, vi } from "vitest";
import { buscarJson, enviarJson, ErroApi, tratarErro } from "./api";

function resposta(corpo: unknown, status = 200): Response {
  if (status === 204) return new Response(null, { status });
  return new Response(typeof corpo === "string" ? corpo : JSON.stringify(corpo), { status });
}

describe("tratarErro", () => {
  it("devolve os dados quando a resposta é de sucesso", () => {
    const dados = tratarErro({ resposta: resposta({}, 200), dados: { email: "a@b.com" } });

    expect(dados).toEqual({ email: "a@b.com" });
  });

  it("lança ErroApi com status, código, tipo e mensagem da API", () => {
    const resultado = {
      resposta: resposta({}, 409),
      dados: { type: "conflict", code: "SalaEncerrada", message: "Esta sala já terminou." },
    };

    let erro: unknown;
    try {
      tratarErro(resultado);
    } catch (e) {
      erro = e;
    }

    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro).toMatchObject({ status: 409, codigo: "SalaEncerrada", tipo: "conflict", message: "Esta sala já terminou." });
  });

  it("usa valores padrão quando a resposta de erro vem sem corpo", () => {
    let erro: ErroApi | undefined;
    try {
      tratarErro({ resposta: resposta("", 500), dados: {} });
    } catch (e) {
      erro = e as ErroApi;
    }

    expect(erro?.status).toBe(500);
    expect(erro?.codigo).toBe("ERRO_HTTP");
    expect(erro?.tipo).toBe("error");
    expect(erro?.message).toBe("Erro inesperado.");
  });

  it("repassa a mensagem do limite de uso (429)", () => {
    const resultado = {
      resposta: resposta({}, 429),
      dados: { type: "tooManyRequests", code: "LimiteExcedido", message: "Muitas requisições. Aguarde um pouco e tente novamente." },
    };

    expect(() => tratarErro(resultado)).toThrow("Muitas requisições. Aguarde um pouco e tente novamente.");
  });
});

describe("buscarJson", () => {
  it("faz GET incluindo os cookies e devolve o JSON", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta([{ id: 1 }]));
    vi.stubGlobal("fetch", fetchFalso);

    const resultado = await buscarJson<{ id: number }[]>("/api/conteudo");

    expect(fetchFalso).toHaveBeenCalledWith("/api/conteudo", { credentials: "include" });
    expect(resultado.dados).toEqual([{ id: 1 }]);
    expect(resultado.resposta.ok).toBe(true);
  });

  it("devolve objeto vazio quando o corpo não é um JSON válido", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta("<html>erro</html>", 502)));

    const resultado = await buscarJson("/api/conteudo");

    expect(resultado.dados).toEqual({});
    expect(resultado.resposta.status).toBe(502);
  });
});

describe("enviarJson", () => {
  it("faz POST com cookies, cabeçalho JSON e o corpo serializado", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta({ codigo: "ABC123" }, 201));
    vi.stubGlobal("fetch", fetchFalso);

    const resultado = await enviarJson<{ codigo: string }>("/api/salas", { nome: "Turma 1" });

    expect(fetchFalso).toHaveBeenCalledWith("/api/salas", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: "Turma 1" }),
    });
    expect(resultado.dados).toEqual({ codigo: "ABC123" });
  });

  it("envia sem corpo quando nenhum corpo é informado", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta({}, 204));
    vi.stubGlobal("fetch", fetchFalso);

    await enviarJson("/api/auth/sair");

    expect(fetchFalso.mock.calls[0][1].body).toBeUndefined();
  });
});
