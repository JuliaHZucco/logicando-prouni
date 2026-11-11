import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderizarComRotas } from "../../../testes/renderizar";
import { sairDoModerador } from "../servicos/moderadorApi";
import CabecalhoDaSala from "./CabecalhoDaSala";
import CabecalhoModerador from "./CabecalhoModerador";
import LinkVoltarModerador from "./LinkVoltarModerador";

vi.mock("../servicos/moderadorApi", () => ({ sairDoModerador: vi.fn() }));

describe("CabecalhoDaSala", () => {
  it("mostra o código e a rodada", () => {
    renderizarComRotas("/", { "/": <CabecalhoDaSala codigo="ABC123" rodada={2} /> });

    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("RODADA")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("mostra o nome e a etapa só quando são informados", () => {
    const { unmount } = renderizarComRotas("/", { "/": <CabecalhoDaSala codigo="ABC123" rodada={1} /> });
    expect(screen.queryByText("Turma A")).not.toBeInTheDocument();
    unmount();

    renderizarComRotas("/", { "/": <CabecalhoDaSala codigo="ABC123" rodada={1} nome="Turma A" etapa="Pergunta 1 de 3" /> });

    expect(screen.getByText("Turma A")).toBeInTheDocument();
    expect(screen.getByText("Pergunta 1 de 3")).toBeInTheDocument();
  });
});

describe("LinkVoltarModerador", () => {
  it("é um link para o destino com o texto informado", () => {
    renderizarComRotas("/", { "/": <LinkVoltarModerador para="/moderador/salas" texto="Minhas salas" /> });

    expect(screen.getByRole("link", { name: "Minhas salas" })).toHaveAttribute("href", "/moderador/salas");
  });
});

describe("CabecalhoModerador", () => {
  it("mostra o e-mail do moderador e o link para as salas", () => {
    renderizarComRotas("/", { "/": <CabecalhoModerador email="prof@feevale.br" /> });

    expect(screen.getByText("prof@feevale.br")).toBeInTheDocument();
    expect(screen.getByText("PAINEL DO MODERADOR")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Feevale Prouni/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Minhas salas" })).toHaveAttribute("href", "/moderador/salas");
  });

  it("'Sair' encerra a sessão e leva à tela de login", async () => {
    vi.mocked(sairDoModerador).mockResolvedValue(undefined);
    renderizarComRotas("/", { "/": <CabecalhoModerador email="prof@feevale.br" />, "/moderador/login": <div>Tela de login</div> });

    await userEvent.click(screen.getByRole("button", { name: "Sair" }));

    expect(sairDoModerador).toHaveBeenCalledOnce();
    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
  });
});
