import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ContextoConteudo } from "../../funcionalidades/duvidas/contexto/ContextoConteudo";
import { iniciarPartida } from "../../funcionalidades/quiz/servicos/quizApi";
import { criarCategorias } from "../../testes/fabricas";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaQuizMenu from "./PaginaQuizMenu";

vi.mock("../../funcionalidades/quiz/servicos/quizApi", () => ({ iniciarPartida: vi.fn() }));

function Destino() {
  const local = useLocation();
  const partida = (local.state as { partida?: { partidaId: number } } | null)?.partida;
  return <div>Jogando a partida {partida?.partidaId}</div>;
}

function renderizar() {
  return renderizarComRotas(
    "/quiz",
    { "/quiz": <PaginaQuizMenu />, "/quiz/jogar": <Destino /> },
    (filhos) => <ContextoConteudo.Provider value={{ categorias: criarCategorias(), totalGeralDuvidas: 4 }}>{filhos}</ContextoConteudo.Provider>,
  );
}

const campoQuantidade = () => screen.getByLabelText("Quantidade de perguntas");
const botaoMais = () => screen.getByRole("button", { name: "Aumentar quantidade de perguntas" });
const botaoMenos = () => screen.getByRole("button", { name: "Diminuir quantidade de perguntas" });
const iniciar = () => userEvent.click(screen.getByRole("button", { name: "Iniciar quiz" }));

describe("PaginaQuizMenu", () => {
  it("começa no modo aleatório com 5 perguntas", () => {
    renderizar();

    expect(screen.getByRole("button", { name: /Modo aleatório/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Uma categoria/ })).toHaveAttribute("aria-pressed", "false");
    expect(campoQuantidade()).toHaveValue(5);
  });

  it("inicia uma partida aleatória e abre a tela do jogo com a partida recebida", async () => {
    vi.mocked(iniciarPartida).mockResolvedValue({ partidaId: 9, perguntas: [] });
    renderizar();

    await iniciar();

    expect(iniciarPartida).toHaveBeenCalledExactlyOnceWith({ modo: "aleatorio", categorias: [], quantidade: 5 });
    expect(await screen.findByText("Jogando a partida 9")).toBeInTheDocument();
  });

  it("os botões de quantidade respeitam o mínimo de 1 e o máximo de 10", async () => {
    renderizar();

    for (let vez = 0; vez < 4; vez++) await userEvent.click(botaoMenos());
    expect(campoQuantidade()).toHaveValue(1);
    expect(botaoMenos()).toBeDisabled();

    for (let vez = 0; vez < 9; vez++) await userEvent.click(botaoMais());
    expect(campoQuantidade()).toHaveValue(10);
    expect(botaoMais()).toBeDisabled();
  });

  it("corrige valores digitados fora do intervalo", () => {
    renderizar();

    fireEvent.change(campoQuantidade(), { target: { value: "25" } });
    expect(campoQuantidade()).toHaveValue(10);

    fireEvent.change(campoQuantidade(), { target: { value: "0" } });
    expect(campoQuantidade()).toHaveValue(1);
  });

  it("no modo categoria lista as categorias e envia a escolhida", async () => {
    vi.mocked(iniciarPartida).mockResolvedValue({ partidaId: 9, perguntas: [] });
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: /Uma categoria/ }));
    const seletor = screen.getByLabelText("Selecionar categoria");
    expect(seletor).toHaveValue("elegibilidade");
    await userEvent.selectOptions(seletor, "prazos");
    await iniciar();

    expect(iniciarPartida).toHaveBeenCalledExactlyOnceWith({ modo: "categoria", categorias: ["prazos"], quantidade: 5 });
  });

  it("no modo misto começa com todas as categorias e envia as que continuarem marcadas", async () => {
    vi.mocked(iniciarPartida).mockResolvedValue({ partidaId: 9, perguntas: [] });
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: /Misto/ }));
    expect(screen.getByText("Categorias selecionadas (3)")).toBeInTheDocument();
    expect(screen.getByText(/o mínimo é uma pergunta por categoria escolhida \(3\)/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Prazos" }));
    expect(screen.getByText("Categorias selecionadas (2)")).toBeInTheDocument();
    await iniciar();

    expect(iniciarPartida).toHaveBeenCalledExactlyOnceWith({ modo: "misto", categorias: ["elegibilidade", "bolsas"], quantidade: 5 });
  });

  it("no modo misto não deixa iniciar sem nenhuma categoria", async () => {
    renderizar();
    await userEvent.click(screen.getByRole("button", { name: /Misto/ }));

    for (const nome of ["Elegibilidade", "Prazos", "Bolsas"]) await userEvent.click(screen.getByRole("button", { name: nome }));

    expect(screen.getByText("Selecione pelo menos uma categoria para iniciar o quiz.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar quiz" })).toBeDisabled();
  });

  it("no modo misto o mínimo de perguntas é o número de categorias escolhidas", async () => {
    renderizar();
    await userEvent.click(screen.getByRole("button", { name: /Misto/ }));

    await userEvent.click(botaoMenos());
    await userEvent.click(botaoMenos());

    expect(campoQuantidade()).toHaveValue(3);
    expect(botaoMenos()).toBeDisabled();
  });

  it("mostra o erro do servidor e permite tentar de novo", async () => {
    vi.mocked(iniciarPartida).mockRejectedValue(new Error("Não há perguntas suficientes para essa configuração."));
    renderizar();

    await iniciar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Não há perguntas suficientes para essa configuração.");
    expect(screen.getByRole("button", { name: "Iniciar quiz" })).toBeEnabled();
  });

  it("mostra 'Iniciando...' e trava o botão enquanto espera", async () => {
    vi.mocked(iniciarPartida).mockReturnValue(new Promise(() => undefined));
    renderizar();

    await iniciar();

    expect(await screen.findByRole("button", { name: /Iniciando/ })).toBeDisabled();
  });
});
