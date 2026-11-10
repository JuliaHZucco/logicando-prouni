import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ContextoConteudo } from "../../funcionalidades/duvidas/contexto/ContextoConteudo";
import { criarSala } from "../../funcionalidades/moderador/servicos/moderadorApi";
import { criarCategorias } from "../../testes/fabricas";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaModeradorCriarSala from "./PaginaModeradorCriarSala";

vi.mock("../../funcionalidades/moderador/servicos/moderadorApi", () => ({ criarSala: vi.fn() }));

function SalaAberta() {
  const { codigo } = useParams();
  return <div>Sala {codigo} aberta</div>;
}

function renderizar() {
  return renderizarComRotas(
    "/moderador/salas/nova",
    { "/moderador/salas/nova": <PaginaModeradorCriarSala />, "/moderador/sala/:codigo": <SalaAberta /> },
    (filhos) => <ContextoConteudo.Provider value={{ categorias: criarCategorias(), totalGeralDuvidas: 4 }}>{filhos}</ContextoConteudo.Provider>,
  );
}

const campoNome = () => screen.getByLabelText("NOME DA SALA");
const botaoCriar = () => screen.getByRole("button", { name: /Criar sala e gerar código|Criando/ });
const quantidade = (container: HTMLElement) => container.querySelector(".quiz-quantidade-valor")?.textContent;

describe("PaginaModeradorCriarSala", () => {
  it("só habilita a criação depois de dar um nome à sala", async () => {
    renderizar();
    expect(botaoCriar()).toBeDisabled();

    await userEvent.type(campoNome(), "Turma A");

    expect(botaoCriar()).toBeEnabled();
  });

  it("não aceita um nome feito só de espaços", async () => {
    renderizar();

    await userEvent.type(campoNome(), "     ");

    expect(botaoCriar()).toBeDisabled();
  });

  it("cria uma sala aleatória sem cronômetro e abre a sala com o código recebido", async () => {
    vi.mocked(criarSala).mockResolvedValue({ codigo: "XYZ789" });
    renderizar();

    await userEvent.type(campoNome(), "  Turma A  ");
    await userEvent.click(botaoCriar());

    expect(criarSala).toHaveBeenCalledExactlyOnceWith({
      nome: "Turma A",
      modo: "aleatorio",
      categorias: [],
      quantidade: 5,
      segundosPorPergunta: null,
    });
    expect(await screen.findByText("Sala XYZ789 aberta")).toBeInTheDocument();
  });

  it("com cronômetro envia os segundos informados (30 por padrão)", async () => {
    vi.mocked(criarSala).mockResolvedValue({ codigo: "XYZ789" });
    renderizar();
    await userEvent.type(campoNome(), "Turma A");

    await userEvent.click(screen.getByLabelText("Usar cronômetro"));
    const segundos = screen.getByLabelText("Segundos (10 a 60):");
    expect(segundos).toHaveValue(30);
    await userEvent.clear(segundos);
    await userEvent.type(segundos, "45");
    await userEvent.click(botaoCriar());

    expect(criarSala).toHaveBeenCalledWith(expect.objectContaining({ segundosPorPergunta: 45 }));
  });

  it("recusa um cronômetro fora de 10 a 60 segundos e explica o motivo", async () => {
    renderizar();
    await userEvent.type(campoNome(), "Turma A");
    await userEvent.click(screen.getByLabelText("Usar cronômetro"));

    const segundos = screen.getByLabelText("Segundos (10 a 60):");
    await userEvent.clear(segundos);
    await userEvent.type(segundos, "5");

    expect(botaoCriar()).toBeDisabled();
    expect(screen.getByText("O cronômetro deve ter de 10 a 60 segundos.")).toBeInTheDocument();
  });

  it.each([
    ["10", true],
    ["60", true],
    ["9", false],
    ["61", false],
  ])("cronômetro de %s segundos: criação permitida = %s", async (valor, permitido) => {
    renderizar();
    await userEvent.type(campoNome(), "Turma A");
    await userEvent.click(screen.getByLabelText("Usar cronômetro"));

    const segundos = screen.getByLabelText("Segundos (10 a 60):");
    await userEvent.clear(segundos);
    await userEvent.type(segundos, valor);

    if (permitido) expect(botaoCriar()).toBeEnabled();
    else expect(botaoCriar()).toBeDisabled();
  });

  it("no modo categoria envia a categoria escolhida", async () => {
    vi.mocked(criarSala).mockResolvedValue({ codigo: "XYZ789" });
    renderizar();
    await userEvent.type(campoNome(), "Turma A");

    await userEvent.click(screen.getByRole("button", { name: /Uma categoria/ }));
    await userEvent.selectOptions(screen.getByLabelText("CATEGORIA"), "bolsas");
    await userEvent.click(botaoCriar());

    expect(criarSala).toHaveBeenCalledWith(expect.objectContaining({ modo: "categoria", categorias: ["bolsas"] }));
  });

  it("no modo misto não deixa criar sem categoria e avisa", async () => {
    renderizar();
    await userEvent.type(campoNome(), "Turma A");
    await userEvent.click(screen.getByRole("button", { name: /Misto/ }));

    for (const nome of ["Elegibilidade", "Prazos", "Bolsas"]) await userEvent.click(screen.getByRole("button", { name: nome }));

    expect(botaoCriar()).toBeDisabled();
    expect(screen.getAllByText("Escolha ao menos uma categoria.").length).toBeGreaterThan(0);
  });

  it("no modo misto envia só as categorias marcadas", async () => {
    vi.mocked(criarSala).mockResolvedValue({ codigo: "XYZ789" });
    renderizar();
    await userEvent.type(campoNome(), "Turma A");
    await userEvent.click(screen.getByRole("button", { name: /Misto/ }));

    await userEvent.click(screen.getByRole("button", { name: "Elegibilidade" }));
    await userEvent.click(botaoCriar());

    expect(criarSala).toHaveBeenCalledWith(expect.objectContaining({ modo: "misto", categorias: ["prazos", "bolsas"] }));
  });

  it("os botões de quantidade respeitam 1 a 10 e o mínimo de uma pergunta por categoria no misto", async () => {
    const { container } = renderizar();
    const menos = () => screen.getByRole("button", { name: "Diminuir quantidade de perguntas" });
    const mais = () => screen.getByRole("button", { name: "Aumentar quantidade de perguntas" });

    for (let vez = 0; vez < 4; vez++) await userEvent.click(menos());
    expect(quantidade(container)).toBe("1");
    expect(menos()).toBeDisabled();
    for (let vez = 0; vez < 9; vez++) await userEvent.click(mais());
    expect(quantidade(container)).toBe("10");
    expect(mais()).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /Misto/ }));
    for (let vez = 0; vez < 10; vez++) {
      if (!menos().hasAttribute("disabled")) await userEvent.click(menos());
    }
    expect(quantidade(container)).toBe("3");
  });

  it("mostra o erro do servidor e deixa tentar de novo", async () => {
    vi.mocked(criarSala).mockRejectedValue(new Error("Não há perguntas suficientes para essa configuração."));
    renderizar();
    await userEvent.type(campoNome(), "Turma A");

    await userEvent.click(botaoCriar());

    expect(await screen.findByRole("alert")).toHaveTextContent("Não há perguntas suficientes para essa configuração.");
    expect(screen.getByRole("button", { name: "Criar sala e gerar código" })).toBeEnabled();
  });

  it("mostra 'Criando...' e trava o botão enquanto espera", async () => {
    vi.mocked(criarSala).mockReturnValue(new Promise(() => undefined));
    renderizar();
    await userEvent.type(campoNome(), "Turma A");

    await userEvent.click(botaoCriar());

    expect(await screen.findByRole("button", { name: /Criando/ })).toBeDisabled();
  });
});
