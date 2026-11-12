import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EntradaRapida from "./EntradaRapida";

describe("EntradaRapida", () => {
  it("mostra o QR code e o endereço direto da sala", () => {
    render(<EntradaRapida codigo="ABC123" />);

    expect(screen.getByTitle("QR code para entrar na sala ABC123")).toBeInTheDocument();
    expect(screen.getByText(`${window.location.host}/sala/ABC123`)).toBeInTheDocument();
  });

  it("'Copiar link' copia o endereço completo e avisa", async () => {
    const usuario = userEvent.setup();
    render(<EntradaRapida codigo="ABC123" />);

    await usuario.click(screen.getByRole("button", { name: /Copiar link/ }));

    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/sala/ABC123`);
    expect(screen.getByText("Link copiado!")).toBeInTheDocument();
  });

  it("avisa quando não consegue copiar", async () => {
    const usuario = userEvent.setup();
    render(<EntradaRapida codigo="ABC123" />);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("bloqueado")) },
    });

    await usuario.click(screen.getByRole("button", { name: /Copiar link/ }));

    expect(screen.getByText(/Não foi possível copiar/)).toBeInTheDocument();
  });
});
