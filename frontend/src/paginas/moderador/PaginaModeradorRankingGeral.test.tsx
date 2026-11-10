import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buscarRankingGeral } from "../../funcionalidades/moderador/servicos/moderadorApi";
import type { LinhaRanking } from "../../funcionalidades/salas/tipos";
import { buscarEstadoDaSala } from "../../funcionalidades/salas/servicos/salasApi";
import { ErroApi } from "../../utilitarios/api";
import { criarEstado } from "../../testes/fabricas";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaModeradorRankingGeral from "./PaginaModeradorRankingGeral";

vi.mock("../../funcionalidades/moderador/servicos/moderadorApi", () => ({ buscarRankingGeral: vi.fn() }));
vi.mock("../../funcionalidades/salas/servicos/salasApi", () => ({ buscarEstadoDaSala: vi.fn() }));

const ranking: LinhaRanking[] = [
  { participanteId: 1, apelido: "Ana", acertos: 4, posicao: 1, perguntasExibidas: 5, aproveitamento: 80 },
  { participanteId: 2, apelido: "Bruno", acertos: 4, posicao: 1, perguntasExibidas: 5, aproveitamento: 80 },
  { participanteId: 3, apelido: "Clara", acertos: 1, posicao: 3, perguntasExibidas: 0, aproveitamento: null },
  { participanteId: 4, apelido: "Davi", acertos: 0, posicao: 4, perguntasExibidas: 5, aproveitamento: 0 },
];

function renderizar(entrada = "/moderador/sala/ABC123/ranking") {
  return renderizarComRotas(entrada, {
    "/moderador/sala/:codigo/ranking": <PaginaModeradorRankingGeral />,
    "/moderador/salas": <div>Minhas salas</div>,
  });
}

function erroDeApi(status: number) {
  return new ErroApi({ status, codigo: "ERRO_HTTP", tipo: "error", mensagem: "Falhou." });
}

describe("PaginaModeradorRankingGeral", () => {
  it("mostra 'Carregando ranking...' enquanto espera", () => {
    vi.mocked(buscarRankingGeral).mockReturnValue(new Promise(() => undefined));
    vi.mocked(buscarEstadoDaSala).mockReturnValue(new Promise(() => undefined));
    renderizar();

    expect(screen.getByText("Carregando ranking...")).toBeInTheDocument();
  });

  it("lista todos os participantes com posição, acertos e aproveitamento", async () => {
    vi.mocked(buscarRankingGeral).mockResolvedValue(ranking);
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado({ nome: "Turma A", rodada: 2 }));
    renderizar();

    expect(await screen.findByRole("heading", { name: "Ranking geral" })).toBeInTheDocument();
    expect(screen.getAllByText("1º")).toHaveLength(2);
    expect(screen.getByText("Davi")).toBeInTheDocument();
    expect(screen.getAllByText("4 de 5")).toHaveLength(2);
    expect(screen.getAllByText("80%")).toHaveLength(2);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("mostra um traço quando ainda não há aproveitamento", async () => {
    vi.mocked(buscarRankingGeral).mockResolvedValue([ranking[2]]);
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado());
    renderizar();

    await screen.findByText("Clara");

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("mostra o cabeçalho da sala e conta os participantes", async () => {
    vi.mocked(buscarRankingGeral).mockResolvedValue(ranking);
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado({ nome: "Turma A", rodada: 2 }));
    renderizar();

    expect(await screen.findByText("Turma A")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText(/4 participantes/)).toBeInTheDocument();
  });

  it("usa o singular quando só há um participante", async () => {
    vi.mocked(buscarRankingGeral).mockResolvedValue([ranking[0]]);
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado());
    renderizar();

    expect(await screen.findByText(/1 participante\./)).toBeInTheDocument();
  });

  it("avisa quando ninguém entrou na sala", async () => {
    vi.mocked(buscarRankingGeral).mockResolvedValue([]);
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado());
    renderizar();

    expect(await screen.findByText("Ninguém entrou nesta sala.")).toBeInTheDocument();
  });

  it("consulta a sala pelo código em maiúsculas e tem o link de volta ao pódio", async () => {
    vi.mocked(buscarRankingGeral).mockResolvedValue(ranking);
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado());
    renderizar("/moderador/sala/abc123/ranking");

    await screen.findByRole("heading", { name: "Ranking geral" });

    expect(buscarRankingGeral).toHaveBeenCalledWith("ABC123");
    expect(buscarEstadoDaSala).toHaveBeenCalledWith("ABC123");
    expect(screen.getByRole("link", { name: /Voltar ao pódio/ })).toHaveAttribute("href", "/moderador/sala/ABC123");
  });

  it.each([403, 404])("volta para as salas quando a API responde %i", async (status) => {
    vi.mocked(buscarRankingGeral).mockRejectedValue(erroDeApi(status));
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado());
    renderizar();

    expect(await screen.findByText("Minhas salas")).toBeInTheDocument();
  });

  it("mostra a mensagem para outros erros", async () => {
    vi.mocked(buscarRankingGeral).mockRejectedValue(new Error("Erro ao carregar o ranking."));
    vi.mocked(buscarEstadoDaSala).mockResolvedValue(criarEstado());
    renderizar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao carregar o ranking.");
  });
});
