import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderizarNoSite } from "../../testes/renderizar";
import Inicio from "./Inicio";
import PaginaCategoria from "./PaginaCategoria";
import PaginaNaoEncontrada from "./PaginaNaoEncontrada";
import ResultadoBusca from "./ResultadoBusca";

describe("Inicio", () => {
  it("dá as boas-vindas e lista todas as categorias com o progresso de cada uma", () => {
    renderizarNoSite(<Inicio />, { vistas: ["eleg-1", "praz-1"] });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Suas dúvidas do PROUNI, resolvidas.");
    expect(screen.getByRole("link", { name: /Elegibilidade/ })).toHaveAttribute("href", "/categoria/elegibilidade");
    expect(screen.getByRole("link", { name: /Prazos/ })).toHaveAttribute("href", "/categoria/prazos");
    expect(screen.getByRole("link", { name: /Bolsas/ })).toHaveAttribute("href", "/categoria/bolsas");
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByText("1/1")).toBeInTheDocument();
    expect(screen.getByText("0/1")).toBeInTheDocument();
  });

  it("mostra quantas dúvidas já foram vistas no total", () => {
    renderizarNoSite(<Inicio />, { vistas: ["eleg-1", "praz-1"] });

    expect(screen.getByText(/de 4 dúvidas vistas/)).toHaveTextContent("2 de 4 dúvidas vistas");
  });

  it("chama para o quiz", () => {
    renderizarNoSite(<Inicio />);

    expect(screen.getByRole("link", { name: /Teste o que você aprendeu/ })).toHaveAttribute("href", "/quiz");
  });
});

describe("PaginaCategoria", () => {
  const entrada = (caminho: string) => ({ entrada: caminho, rota: "/categoria/:categoriaId" });

  it("mostra o nome da categoria, o progresso e todas as dúvidas", () => {
    renderizarNoSite(<PaginaCategoria />, { ...entrada("/categoria/elegibilidade"), vistas: ["eleg-1"] });

    expect(screen.getByRole("heading", { name: "Elegibilidade" })).toBeInTheDocument();
    expect(screen.getByText("1/2 vistas")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: /Quem pode participar do ProUni\?/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Qual é o limite de renda\?/ })).toBeInTheDocument();
  });

  it("abre a primeira dúvida por padrão e a marca como vista", () => {
    const marcar = vi.fn();
    renderizarNoSite(<PaginaCategoria />, { ...entrada("/categoria/elegibilidade"), marcarDuvidaComoVista: marcar });

    expect(screen.getByText("Estudantes que fizeram o Enem.")).toBeInTheDocument();
    expect(marcar).toHaveBeenCalledWith("eleg-1");
  });

  it("abre a dúvida pedida na URL (quando vem do 'Ler a dúvida completa' do quiz)", () => {
    renderizarNoSite(<PaginaCategoria />, entrada("/categoria/elegibilidade?duvida=eleg-2"));

    expect(screen.getByText("Até 1,5 salário mínimo por pessoa.")).toBeInTheDocument();
    expect(screen.queryByText("Estudantes que fizeram o Enem.")).not.toBeInTheDocument();
  });

  it("ignora uma dúvida da URL que não pertence à categoria", () => {
    renderizarNoSite(<PaginaCategoria />, entrada("/categoria/elegibilidade?duvida=praz-1"));

    expect(screen.getByText("Estudantes que fizeram o Enem.")).toBeInTheDocument();
  });

  it("categoria inexistente volta para o início", () => {
    renderizarNoSite(<PaginaCategoria />, entrada("/categoria/nao-existe"));

    expect(screen.getByTestId("local")).toHaveTextContent("/");
  });
});

describe("ResultadoBusca", () => {
  const busca = (termo: string) => ({ entrada: `/buscar?q=${encodeURIComponent(termo)}`, rota: "/buscar" });

  it("mostra o termo e a quantidade de dúvidas encontradas", () => {
    renderizarNoSite(<ResultadoBusca />, busca("inscrições"));

    expect(screen.getByRole("heading", { name: "Resultados para “inscrições”" })).toBeInTheDocument();
    expect(screen.getByText("1 dúvida encontrada")).toBeInTheDocument();
  });

  it("procura também no texto da resposta", () => {
    renderizarNoSite(<ResultadoBusca />, busca("Enem"));

    expect(screen.getByText("2 dúvidas encontradas")).toBeInTheDocument();
  });

  it("ignora maiúsculas, minúsculas e acentos", () => {
    renderizarNoSite(<ResultadoBusca />, busca("INSCRICOES"));

    expect(screen.getByRole("button", { name: /Quando abrem as inscrições\?/ })).toBeInTheDocument();
  });

  it("mostra o nome da categoria em cada resultado", () => {
    renderizarNoSite(<ResultadoBusca />, busca("bolsa parcial"));

    expect(screen.getByRole("button", { name: /Bolsas.*O que é a bolsa parcial\?/ })).toBeInTheDocument();
  });

  it("avisa quando nada é encontrado", () => {
    renderizarNoSite(<ResultadoBusca />, busca("xyz"));

    expect(screen.getByText("0 dúvidas encontradas")).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma dúvida encontrada para "xyz"/)).toBeInTheDocument();
  });

  it("deixa abrir um resultado para ler a resposta", async () => {
    renderizarNoSite(<ResultadoBusca />, busca("bolsa parcial"));

    await userEvent.click(screen.getByRole("button", { name: /O que é a bolsa parcial\?/ }));

    expect(screen.getByText("Cobre 50% da mensalidade.")).toBeInTheDocument();
  });

  it("tem os links para voltar às categorias e limpar a busca", () => {
    renderizarNoSite(<ResultadoBusca />, busca("xyz"));

    expect(screen.getByRole("link", { name: /Voltar às categorias/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Limpar" })).toHaveAttribute("href", "/");
  });

});

describe("PaginaNaoEncontrada", () => {
  it("avisa que a página não existe e leva de volta ao início", () => {
    renderizarNoSite(<PaginaNaoEncontrada />);

    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
    expect(screen.getByText("ERRO 404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute("href", "/");
  });
});
