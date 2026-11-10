import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AreaCarregando from "../../../componentes/AreaCarregando";
import CardCategoria from "../../../componentes/CardCategoria";
import { criarCategorias } from "../../../testes/fabricas";
import { renderizarNoSite } from "../../../testes/renderizar";
import AcordeaoDuvidas from "./AcordeaoDuvidas";
import ChamadaQuiz from "./ChamadaQuiz";

const duvidas = criarCategorias()[0].categoriaDuvidas;

describe("AcordeaoDuvidas", () => {
  it("começa com todas as dúvidas fechadas quando nenhuma é indicada", () => {
    renderizarNoSite(<AcordeaoDuvidas duvidasExibidas={duvidas} />);

    for (const botao of screen.getAllByRole("button")) expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Estudantes que fizeram o Enem.")).not.toBeInTheDocument();
  });

  it("abre a dúvida indicada e a marca como vista", () => {
    const marcar = vi.fn();
    renderizarNoSite(<AcordeaoDuvidas duvidasExibidas={duvidas} duvidaIdAbertaPadrao="eleg-2" />, { marcarDuvidaComoVista: marcar });

    expect(screen.getByRole("button", { name: /Qual é o limite de renda\?/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Até 1,5 salário mínimo por pessoa.")).toBeInTheDocument();
    expect(marcar).toHaveBeenCalledWith("eleg-2");
  });

  it("clicar abre a dúvida, mostra a resposta e marca como vista", async () => {
    const marcar = vi.fn();
    renderizarNoSite(<AcordeaoDuvidas duvidasExibidas={duvidas} />, { marcarDuvidaComoVista: marcar });

    await userEvent.click(screen.getByRole("button", { name: /Quem pode participar do ProUni\?/ }));

    expect(screen.getByText("Estudantes que fizeram o Enem.")).toBeInTheDocument();
    expect(marcar).toHaveBeenCalledExactlyOnceWith("eleg-1");
  });

  it("clicar de novo fecha a dúvida sem marcar outra vez", async () => {
    const marcar = vi.fn();
    renderizarNoSite(<AcordeaoDuvidas duvidasExibidas={duvidas} duvidaIdAbertaPadrao="eleg-1" />, { marcarDuvidaComoVista: marcar });
    marcar.mockClear();

    await userEvent.click(screen.getByRole("button", { name: /Quem pode participar do ProUni\?/ }));

    expect(screen.queryByText("Estudantes que fizeram o Enem.")).not.toBeInTheDocument();
    expect(marcar).not.toHaveBeenCalled();
  });

  it("só uma dúvida fica aberta por vez", async () => {
    renderizarNoSite(<AcordeaoDuvidas duvidasExibidas={duvidas} duvidaIdAbertaPadrao="eleg-1" />);

    await userEvent.click(screen.getByRole("button", { name: /Qual é o limite de renda\?/ }));

    expect(screen.getByText("Até 1,5 salário mínimo por pessoa.")).toBeInTheDocument();
    expect(screen.queryByText("Estudantes que fizeram o Enem.")).not.toBeInTheDocument();
  });

  it("marca com um ícone as dúvidas já vistas que estão fechadas", () => {
    const { container } = renderizarNoSite(<AcordeaoDuvidas duvidasExibidas={duvidas} />, { vistas: ["eleg-2"] });

    expect(container.querySelectorAll(".duvida-vista-marcador")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Qual é o limite de renda\?/ }).querySelector(".duvida-vista-marcador")).not.toBeNull();
  });

  it("mostra o rótulo da categoria quando a função é informada", () => {
    renderizarNoSite(<AcordeaoDuvidas duvidasExibidas={duvidas} obterRotuloCategoriaDaDuvida={() => "Elegibilidade"} />);

    expect(screen.getAllByText("Elegibilidade")).toHaveLength(2);
  });
});

describe("ChamadaQuiz", () => {
  it("é um link para o menu do quiz", () => {
    render(
      <MemoryRouter>
        <ChamadaQuiz />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/quiz");
    expect(screen.getByText("Teste o que você aprendeu")).toBeInTheDocument();
  });
});

describe("CardCategoria", () => {
  it("leva à categoria e mostra nome, descrição e progresso", () => {
    render(
      <MemoryRouter>
        <CardCategoria categoria={criarCategorias()[0]} categoriaDuvidasVistas={1} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/categoria/elegibilidade");
    expect(screen.getByText("Quem pode participar do programa.")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "2");
  });
});

describe("AreaCarregando", () => {
  it("mostra 'Carregando...' por padrão", () => {
    render(<AreaCarregando />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando...");
  });

  it("mostra a mensagem informada", () => {
    render(<AreaCarregando mensagem="Abrindo a sala..." />);

    expect(screen.getByRole("status")).toHaveTextContent("Abrindo a sala...");
  });
});
