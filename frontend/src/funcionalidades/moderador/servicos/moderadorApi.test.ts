import { describe, expect, it, vi } from "vitest";
import { ErroApi } from "../../../utilitarios/api";
import { respostaJson } from "../../../testes/respostas";
import { buscarEnderecoPublico, buscarModeradorLogado, buscarRankingGeral, criarSala, entrarComoModerador, listarMinhasSalas, sairDoModerador } from "./moderadorApi";

function simularFetch(resposta: Response) {
  const fetchFalso = vi.fn().mockResolvedValue(resposta);
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

const semFiltros = { busca: "", estado: "" as const, de: "", ate: "" };

describe("moderadorApi", () => {
  it("entrarComoModerador envia e-mail e senha e devolve o moderador", async () => {
    const fetchFalso = simularFetch(respostaJson({ email: "prof@feevale.br" }));

    const moderador = await entrarComoModerador("prof@feevale.br", "Senha1234");

    expect(moderador).toEqual({ email: "prof@feevale.br" });
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/auth/login");
    expect(fetchFalso.mock.calls[0][1]).toMatchObject({ method: "POST", body: JSON.stringify({ email: "prof@feevale.br", senha: "Senha1234" }) });
  });

  it("entrarComoModerador lança o erro da API quando o login falha", async () => {
    simularFetch(respostaJson({ type: "unauthorized", message: "E-mail ou senha incorretos." }, 401));

    await expect(entrarComoModerador("a@b.com", "errada")).rejects.toMatchObject({ status: 401, message: "E-mail ou senha incorretos." });
    await expect(entrarComoModerador("a@b.com", "errada")).rejects.toBeInstanceOf(ErroApi);
  });

  it("buscarModeradorLogado consulta a sessão atual", async () => {
    const fetchFalso = simularFetch(respostaJson({ email: "prof@feevale.br" }));

    expect(await buscarModeradorLogado()).toEqual({ email: "prof@feevale.br" });
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/auth/eu");
  });

  it("sairDoModerador encerra a sessão mesmo quando a resposta vem sem corpo", async () => {
    const fetchFalso = simularFetch(respostaJson(null, 204));

    await expect(sairDoModerador()).resolves.toBeUndefined();
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/auth/sair");
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
  });

  it("criarSala envia a configuração e devolve o código", async () => {
    const fetchFalso = simularFetch(respostaJson({ codigo: "ABC123" }, 201));
    const sala = { nome: "Turma A", modo: "aleatorio" as const, categorias: [], quantidade: 5, segundosPorPergunta: null };

    expect(await criarSala(sala)).toEqual({ codigo: "ABC123" });
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify(sala));
  });

  it("listarMinhasSalas sem filtros não manda parâmetros", async () => {
    const fetchFalso = simularFetch(respostaJson([]));

    await listarMinhasSalas(semFiltros);

    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas/minhas");
  });

  it("listarMinhasSalas manda só os filtros preenchidos e tira os espaços da busca", async () => {
    const fetchFalso = simularFetch(respostaJson([]));

    await listarMinhasSalas({ busca: "  turma a ", estado: "encerrada", de: "2026-11-01", ate: "" });

    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas/minhas?busca=turma+a&estado=encerrada&de=2026-11-01");
  });

  it("listarMinhasSalas ignora uma busca feita só de espaços", async () => {
    const fetchFalso = simularFetch(respostaJson([]));

    await listarMinhasSalas({ ...semFiltros, busca: "   " });

    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas/minhas");
  });

  it("buscarEnderecoPublico devolve o endereço configurado no servidor", async () => {
    const fetchFalso = simularFetch(respostaJson({ enderecoPublico: "https://prouni.feevale.br" }));

    expect(await buscarEnderecoPublico()).toBe("https://prouni.feevale.br");
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/configuracao/publica");
  });

  it("buscarEnderecoPublico devolve null quando o servidor não tem endereço configurado", async () => {
    simularFetch(respostaJson({ enderecoPublico: null }));

    expect(await buscarEnderecoPublico()).toBeNull();
  });

  it("buscarRankingGeral consulta o ranking da sala pelo código", async () => {
    const fetchFalso = simularFetch(respostaJson([{ participanteId: 1 }]));

    expect(await buscarRankingGeral("ABC123")).toEqual([{ participanteId: 1 }]);
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/salas/ABC123/ranking");
  });
});
