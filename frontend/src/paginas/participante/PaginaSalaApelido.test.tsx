import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { entrarNaSala } from "../../funcionalidades/salas/servicos/salasApi";
import { ErroApi } from "../../utilitarios/api";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaSalaApelido from "./PaginaSalaApelido";

vi.mock("../../funcionalidades/salas/servicos/salasApi", () => ({ entrarNaSala: vi.fn() }));

function renderizar(entrada = "/sala/abc123/apelido") {
  return renderizarComRotas(entrada, {
    "/sala/:codigo/apelido": <PaginaSalaApelido />,
    "/sala/:codigo": <div>Dentro da sala</div>,
  });
}

const campo = () => screen.getByLabelText("APELIDO");
const botao = () => screen.getByRole("button", { name: /Entrar na sala|Entrando/ });

describe("PaginaSalaApelido", () => {
  it("mostra o código da sala em maiúsculas e pede o apelido", () => {
    renderizar();

    expect(screen.getByText("SALA ABC123")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Como quer ser chamado(a)?" })).toBeInTheDocument();
  });

  it("só habilita a entrada com um apelido de verdade (sem contar espaços)", async () => {
    renderizar();
    expect(botao()).toBeDisabled();

    await userEvent.type(campo(), "   ");
    expect(botao()).toBeDisabled();

    await userEvent.type(campo(), "Ana");
    expect(botao()).toBeEnabled();
  });

  it("limita o apelido a 20 caracteres", async () => {
    renderizar();

    await userEvent.type(campo(), "a".repeat(25));

    expect(campo()).toHaveValue("a".repeat(20));
  });

  it("entra na sala com o apelido sem espaços nas pontas e abre a partida", async () => {
    vi.mocked(entrarNaSala).mockResolvedValue({ participante: { id: 1, apelido: "Ana" }, reconectado: false });
    renderizar();

    await userEvent.type(campo(), "  Ana  ");
    await userEvent.click(botao());

    expect(entrarNaSala).toHaveBeenCalledExactlyOnceWith("ABC123", "Ana");
    expect(await screen.findByText("Dentro da sala")).toBeInTheDocument();
  });

  it("avisa quando a sala não existe", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(new ErroApi({ status: 404, codigo: "ERRO_HTTP", tipo: "notFound", mensagem: "Código de sala não encontrado." }));
    renderizar();

    await userEvent.type(campo(), "Ana");
    await userEvent.click(botao());

    expect(await screen.findByRole("alert")).toHaveTextContent("Sala não encontrada. Confira o código com o moderador.");
    expect(campo()).toHaveAttribute("aria-invalid", "true");
  });

  it("mostra a mensagem do servidor, por exemplo quando o apelido já está em uso", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(
      new ErroApi({ status: 409, codigo: "ApelidoEmUso", tipo: "conflict", mensagem: "Já existe alguém com o apelido “Ana” nesta sala." }),
    );
    renderizar();

    await userEvent.type(campo(), "Ana");
    await userEvent.click(botao());

    expect(await screen.findByRole("alert")).toHaveTextContent("Já existe alguém com o apelido “Ana” nesta sala.");
  });

  it("usa uma mensagem padrão quando o erro vem sem texto", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(new Error(""));
    renderizar();

    await userEvent.type(campo(), "Ana");
    await userEvent.click(botao());

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao entrar na sala.");
  });

  it("mostra 'Entrando...' e trava o botão enquanto espera", async () => {
    vi.mocked(entrarNaSala).mockReturnValue(new Promise(() => undefined));
    renderizar();

    await userEvent.type(campo(), "Ana");
    await userEvent.click(botao());

    expect(await screen.findByRole("button", { name: /Entrando/ })).toBeDisabled();
  });
});
