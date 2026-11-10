import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { criarCategorias } from "../../../testes/fabricas";
import { useConteudo } from "../hooks/useConteudo";
import { buscarConteudo } from "../servicos/conteudoApi";
import ProvedorConteudo from "./ProvedorConteudo";

vi.mock("../servicos/conteudoApi", () => ({ buscarConteudo: vi.fn() }));

function Consumidor() {
  const { categorias, totalGeralDuvidas } = useConteudo();
  return (
    <div>
      {categorias.map((categoria) => categoria.categoriaNome).join(", ")} | total {totalGeralDuvidas}
    </div>
  );
}

function renderizar() {
  return render(
    <ProvedorConteudo>
      <Consumidor />
    </ProvedorConteudo>,
  );
}

describe("ProvedorConteudo", () => {
  it("mostra 'Carregando conteúdo...' até as categorias chegarem", () => {
    vi.mocked(buscarConteudo).mockReturnValue(new Promise(() => undefined));
    renderizar();

    expect(screen.getByText("Carregando conteúdo...")).toBeInTheDocument();
  });

  it("entrega as categorias e o total de dúvidas para quem estiver dentro", async () => {
    vi.mocked(buscarConteudo).mockResolvedValue(criarCategorias());
    renderizar();

    expect(await screen.findByText("Elegibilidade, Prazos, Bolsas | total 4")).toBeInTheDocument();
  });

  it("mostra o erro e deixa tentar de novo", async () => {
    vi.mocked(buscarConteudo).mockRejectedValueOnce(new Error("Erro ao carregar o conteúdo.")).mockResolvedValueOnce(criarCategorias());
    renderizar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao carregar o conteúdo.");
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText(/Elegibilidade/)).toBeInTheDocument();
    expect(buscarConteudo).toHaveBeenCalledTimes(2);
  });

  it("usa uma mensagem padrão quando o erro vem sem texto", async () => {
    vi.mocked(buscarConteudo).mockRejectedValue(new Error(""));
    renderizar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao carregar o conteúdo.");
  });
});

describe("useConteudo", () => {
  it("falha com uma mensagem clara quando usado fora do provedor", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<Consumidor />)).toThrow("useConteudo deve ser usado dentro de ProvedorConteudo");
  });
});
