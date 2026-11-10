import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { buscarConteudo, buscarDuvidasVistas, registrarDuvidaVista } from "./funcionalidades/duvidas/servicos/conteudoApi";
import { buscarModeradorLogado, listarMinhasSalas, sairDoModerador } from "./funcionalidades/moderador/servicos/moderadorApi";
import { ErroApi } from "./utilitarios/api";
import { criarCategorias } from "./testes/fabricas";

vi.mock("./funcionalidades/duvidas/servicos/conteudoApi", () => ({
  buscarConteudo: vi.fn(),
  buscarDuvidasVistas: vi.fn(),
  registrarDuvidaVista: vi.fn(),
}));
vi.mock("./funcionalidades/moderador/servicos/moderadorApi", () => ({
  buscarModeradorLogado: vi.fn(),
  sairDoModerador: vi.fn(),
  entrarComoModerador: vi.fn(),
  criarSala: vi.fn(),
  listarMinhasSalas: vi.fn(),
  buscarRankingGeral: vi.fn(),
}));

function abrir(caminho: string) {
  return render(
    <MemoryRouter initialEntries={[caminho]}>
      <App />
    </MemoryRouter>,
  );
}

describe("rotas do App", () => {
  beforeEach(() => {
    vi.mocked(buscarConteudo).mockResolvedValue(criarCategorias());
    vi.mocked(buscarDuvidasVistas).mockResolvedValue([]);
    vi.mocked(registrarDuvidaVista).mockResolvedValue(undefined);
    vi.mocked(buscarModeradorLogado).mockResolvedValue({ email: "prof@feevale.br" });
    vi.mocked(sairDoModerador).mockResolvedValue(undefined);
    vi.mocked(listarMinhasSalas).mockResolvedValue([]);
  });

  it("'/' abre o início com as categorias", async () => {
    abrir("/");

    expect(await screen.findByRole("heading", { name: "Categorias" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Elegibilidade/ })).toBeInTheDocument();
  });

  it("'/categoria/:id' abre as dúvidas da categoria", async () => {
    abrir("/categoria/prazos");

    expect(await screen.findByRole("heading", { name: "Prazos" })).toBeInTheDocument();
  });

  it("'/buscar' mostra o resultado da busca", async () => {
    abrir("/buscar?q=inscri%C3%A7%C3%B5es");

    expect(await screen.findByRole("heading", { name: "Resultados para “inscrições”" })).toBeInTheDocument();
  });

  it("'/quiz' abre o menu do quiz", async () => {
    abrir("/quiz");

    expect(await screen.findByText("Escolha como praticar")).toBeInTheDocument();
  });

  it("'/quiz/jogar' sem partida volta ao menu do quiz", async () => {
    abrir("/quiz/jogar");

    expect(await screen.findByText("Escolha como praticar")).toBeInTheDocument();
  });

  it("'/quiz/sala' pede o código da sala", async () => {
    abrir("/quiz/sala");

    expect(await screen.findByRole("heading", { name: "Tem um código de sala?" })).toBeInTheDocument();
  });

  it("'/sala/:codigo/apelido' pede o apelido, sem o cabeçalho do site", () => {
    abrir("/sala/ABC123/apelido");

    expect(screen.getByRole("heading", { name: "Como quer ser chamado(a)?" })).toBeInTheDocument();
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
  });

  it("'/moderador/login' mostra a entrada do moderador", async () => {
    abrir("/moderador/login");

    expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("'/moderador/salas' com sessão ativa abre a lista de salas", async () => {
    abrir("/moderador/salas");

    expect(await screen.findByRole("heading", { name: "Minhas salas" })).toBeInTheDocument();
    expect(screen.getByText("PAINEL DO MODERADOR")).toBeInTheDocument();
  });

  it("'/moderador/salas' sem sessão manda para o login", async () => {
    vi.mocked(buscarModeradorLogado).mockRejectedValue(new ErroApi({ status: 401, codigo: "ERRO_HTTP", tipo: "unauthorized", mensagem: "Entre como moderador para continuar." }));
    abrir("/moderador/salas");

    expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("'/moderador/salas/nova' abre a criação de sala com o conteúdo carregado", async () => {
    abrir("/moderador/salas/nova");

    expect(await screen.findByRole("heading", { name: "Criar sala" })).toBeInTheDocument();
  });

  it("uma rota que não existe mostra a página 404", async () => {
    abrir("/nao-existe");

    expect(await screen.findByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
  });

  it("volta ao topo da página a cada navegação", async () => {
    abrir("/quiz");
    await screen.findByText("Escolha como praticar");

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
