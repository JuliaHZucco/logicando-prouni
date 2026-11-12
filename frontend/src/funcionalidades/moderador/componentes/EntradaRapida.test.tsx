import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buscarEnderecoPublico } from "../servicos/moderadorApi";
import EntradaRapida from "./EntradaRapida";

vi.mock("../servicos/moderadorApi", () => ({ buscarEnderecoPublico: vi.fn() }));

describe("EntradaRapida", () => {
  beforeEach(() => {
    vi.mocked(buscarEnderecoPublico).mockResolvedValue(null);
  });

  it("enquanto consulta o endereço mostra o carregamento, sem QR code", () => {
    vi.mocked(buscarEnderecoPublico).mockReturnValue(new Promise(() => undefined));

    render(<EntradaRapida codigo="ABC123" />);

    expect(screen.getByText("Gerando o QR code...")).toBeInTheDocument();
    expect(screen.queryByTitle(/QR code para entrar/)).not.toBeInTheDocument();
  });

  it("sem endereço público configurado usa o endereço em que o painel foi aberto", async () => {
    render(<EntradaRapida codigo="ABC123" />);

    expect(await screen.findByTitle("QR code para entrar na sala ABC123")).toBeInTheDocument();
    expect(screen.getByText(`${window.location.host}/sala/ABC123`)).toBeInTheDocument();
  });

  it("com endereço público configurado usa ele, mesmo que o painel tenha sido aberto por outro endereço", async () => {
    vi.mocked(buscarEnderecoPublico).mockResolvedValue("https://prouni.feevale.br");

    render(<EntradaRapida codigo="ABC123" />);

    expect(await screen.findByText("prouni.feevale.br/sala/ABC123")).toBeInTheDocument();
    expect(screen.queryByText(`${window.location.host}/sala/ABC123`)).not.toBeInTheDocument();
  });

  it("se a consulta falhar, continua funcionando com o endereço do navegador", async () => {
    vi.mocked(buscarEnderecoPublico).mockRejectedValue(new Error("sem rede"));

    render(<EntradaRapida codigo="ABC123" />);

    expect(await screen.findByText(`${window.location.host}/sala/ABC123`)).toBeInTheDocument();
  });

  it("'Copiar link' copia o endereço completo e avisa", async () => {
    vi.mocked(buscarEnderecoPublico).mockResolvedValue("https://prouni.feevale.br");
    const usuario = userEvent.setup();
    render(<EntradaRapida codigo="ABC123" />);

    await usuario.click(await screen.findByRole("button", { name: /Copiar link/ }));

    expect(await navigator.clipboard.readText()).toBe("https://prouni.feevale.br/sala/ABC123");
    expect(screen.getByText("Link copiado!")).toBeInTheDocument();
  });

  it("avisa quando não consegue copiar", async () => {
    const usuario = userEvent.setup();
    render(<EntradaRapida codigo="ABC123" />);
    const botao = await screen.findByRole("button", { name: /Copiar link/ });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("bloqueado")) },
    });

    await usuario.click(botao);

    expect(screen.getByText(/Não foi possível copiar/)).toBeInTheDocument();
  });
});
