import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { listarMinhasSalas } from "../../funcionalidades/moderador/servicos/moderadorApi";
import type { SalaResumo } from "../../funcionalidades/moderador/tipos";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaModeradorSalas from "./PaginaModeradorSalas";

vi.mock("../../funcionalidades/moderador/servicos/moderadorApi", () => ({ listarMinhasSalas: vi.fn() }));

const salas: SalaResumo[] = [
  { codigo: "ABC123", nome: "Turma A", status: "aguardando", modo: "aleatorio", quantidade: 5, categorias: [], criadaEm: "2026-11-03T14:30:00Z", participantes: 12 },
  { codigo: "DEF456", nome: "Turma B", status: "pergunta_aberta", modo: "categoria", quantidade: 1, categorias: ["Prazos"], criadaEm: "2026-11-04T10:00:00Z", participantes: 1 },
  { codigo: "GHI789", nome: "Turma C", status: "encerrada", modo: "misto", quantidade: 3, categorias: ["Elegibilidade", "Prazos", "Bolsas"], criadaEm: "2026-11-05T09:15:00Z", participantes: 30 },
];

const semFiltros = { busca: "", estado: "", de: "", ate: "" };

function renderizar() {
  return renderizarComRotas("/moderador/salas", { "/moderador/salas": <PaginaModeradorSalas /> });
}

describe("PaginaModeradorSalas", () => {
  it("mostra 'Carregando salas...' enquanto espera a resposta", () => {
    vi.mocked(listarMinhasSalas).mockReturnValue(new Promise(() => undefined));
    renderizar();

    expect(screen.getByText("Carregando salas...")).toBeInTheDocument();
  });

  it("lista as salas do moderador com nome, código, status, modo e participantes", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();

    expect(await screen.findByText("Turma A")).toBeInTheDocument();
    expect(listarMinhasSalas).toHaveBeenCalledWith(semFiltros);
    const tabela = within(screen.getByRole("table"));
    expect(tabela.getByText("ABC123")).toBeInTheDocument();
    expect(tabela.getByText("Aguardando")).toBeInTheDocument();
    expect(tabela.getByText("Em andamento")).toBeInTheDocument();
    expect(tabela.getByText("Encerrada")).toBeInTheDocument();
    expect(tabela.getByText("12")).toBeInTheDocument();
  });

  it("descreve o modo de cada sala", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();

    expect(await screen.findByText("Aleatório · 5 perguntas")).toBeInTheDocument();
    expect(screen.getByText("Prazos · 1 pergunta")).toBeInTheDocument();
    expect(screen.getByText("Misto (3 categorias) · 3 perguntas")).toBeInTheDocument();
  });

  it("mostra a data de criação no formato brasileiro", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue([salas[0]]);
    renderizar();

    await screen.findByText("Turma A");

    expect(screen.getByText(/\d{2}\/\d{2}\/\d{2,4}/)).toBeInTheDocument();
  });

  it("oferece 'Abrir sala' para as ativas e 'Ver resultado' para as encerradas", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();
    await screen.findByText("Turma A");

    const abrir = screen.getAllByRole("link", { name: "Abrir sala" });
    expect(abrir.map((link) => link.getAttribute("href"))).toEqual(["/moderador/sala/ABC123", "/moderador/sala/DEF456"]);
    expect(screen.getByRole("link", { name: "Ver resultado" })).toHaveAttribute("href", "/moderador/sala/GHI789");
  });

  it("tem o atalho para criar uma nova sala", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();

    expect(screen.getByRole("link", { name: /Criar sala/ })).toHaveAttribute("href", "/moderador/salas/nova");
    await screen.findByText("Turma A");
  });

  it("avisa quando nenhuma sala é encontrada", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText("Nenhuma sala encontrada com esses filtros.")).toBeInTheDocument();
  });

  it("mostra o erro quando não consegue carregar as salas", async () => {
    vi.mocked(listarMinhasSalas).mockRejectedValue(new Error("Erro ao carregar as salas."));
    renderizar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao carregar as salas.");
    expect(screen.queryByText("Carregando salas...")).not.toBeInTheDocument();
  });

  it("busca pelo nome depois de a pessoa terminar de digitar", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();
    await screen.findByText("Turma A");

    await userEvent.type(screen.getByLabelText("BUSCAR PELO NOME"), "turma");

    await waitFor(() => expect(listarMinhasSalas).toHaveBeenLastCalledWith({ ...semFiltros, busca: "turma" }));
  });

  it("filtra por status", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();
    await screen.findByText("Turma A");

    await userEvent.selectOptions(screen.getByLabelText("STATUS"), "em_andamento");

    await waitFor(() => expect(listarMinhasSalas).toHaveBeenLastCalledWith({ ...semFiltros, estado: "em_andamento" }));
  });

  it("filtra por período de criação", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();
    await screen.findByText("Turma A");

    await userEvent.type(screen.getByLabelText("CRIADA DE"), "2026-11-01");
    await userEvent.type(screen.getByLabelText("ATÉ"), "2026-11-30");

    await waitFor(() => expect(listarMinhasSalas).toHaveBeenLastCalledWith({ ...semFiltros, de: "2026-11-01", ate: "2026-11-30" }));
  });

  it("'Limpar filtros' só vale com filtro ativo e traz a lista completa de volta", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValue(salas);
    renderizar();
    await screen.findByText("Turma A");
    const limpar = screen.getByRole("button", { name: "Limpar filtros" });
    expect(limpar).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText("STATUS"), "encerrada");
    expect(limpar).toBeEnabled();
    await userEvent.click(limpar);

    expect(screen.getByLabelText("STATUS")).toHaveValue("");
    await waitFor(() => expect(listarMinhasSalas).toHaveBeenLastCalledWith(semFiltros));
  });

  it("mostra quantas salas aparecem em relação ao total sem filtros", async () => {
    vi.mocked(listarMinhasSalas).mockResolvedValueOnce(salas).mockResolvedValueOnce([salas[1]]);
    renderizar();
    expect(await screen.findByText("3 de 3 salas")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("STATUS"), "em_andamento");

    expect(await screen.findByText("1 de 3 salas")).toBeInTheDocument();
  });
});
