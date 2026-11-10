import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { entrarComoModerador, sairDoModerador } from "../../funcionalidades/moderador/servicos/moderadorApi";
import { ErroApi } from "../../utilitarios/api";
import PaginaModeradorLogin from "./PaginaModeradorLogin";

vi.mock("../../funcionalidades/moderador/servicos/moderadorApi", () => ({
  entrarComoModerador: vi.fn(),
  sairDoModerador: vi.fn(),
}));

function renderizar() {
  return render(
    <MemoryRouter initialEntries={["/moderador/login"]}>
      <Routes>
        <Route path="/moderador/login" element={<PaginaModeradorLogin />} />
        <Route path="/moderador/salas" element={<div>Minhas salas</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function preencherEEnviar(email = "prof@feevale.br", senha = "Senha1234") {
  await userEvent.type(screen.getByLabelText("E-MAIL"), email);
  await userEvent.type(screen.getByLabelText("SENHA"), senha);
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("PaginaModeradorLogin", () => {
  beforeEach(() => {
    vi.mocked(sairDoModerador).mockResolvedValue(undefined);
  });

  it("encerra qualquer sessão anterior ao abrir a tela", async () => {
    renderizar();

    await waitFor(() => expect(sairDoModerador).toHaveBeenCalledOnce());
  });

  it("entra com o e-mail e a senha digitados e vai para a lista de salas", async () => {
    vi.mocked(entrarComoModerador).mockResolvedValue({ email: "prof@feevale.br" });
    renderizar();

    await preencherEEnviar("prof@feevale.br", "Senha1234");

    expect(await screen.findByText("Minhas salas")).toBeInTheDocument();
    expect(entrarComoModerador).toHaveBeenCalledExactlyOnceWith("prof@feevale.br", "Senha1234");
  });

  it("mostra o erro de e-mail ou senha incorretos e continua na tela", async () => {
    vi.mocked(entrarComoModerador).mockRejectedValue(
      new ErroApi({ status: 401, codigo: "ERRO_HTTP", tipo: "unauthorized", mensagem: "E-mail ou senha incorretos." }),
    );
    renderizar();

    await preencherEEnviar();

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
    expect(screen.queryByText("Minhas salas")).not.toBeInTheDocument();
  });

  it("mostra a mensagem do limite de tentativas (429)", async () => {
    vi.mocked(entrarComoModerador).mockRejectedValue(
      new ErroApi({
        status: 429,
        codigo: "LimiteExcedido",
        tipo: "tooManyRequests",
        mensagem: "Muitas requisições. Aguarde um pouco e tente novamente.",
      }),
    );
    renderizar();

    await preencherEEnviar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Muitas requisições. Aguarde um pouco e tente novamente.");
  });

  it("usa uma mensagem padrão quando o erro vem sem texto", async () => {
    vi.mocked(entrarComoModerador).mockRejectedValue(new Error(""));
    renderizar();

    await preencherEEnviar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao entrar.");
  });

  it("desabilita o botão e mostra 'Entrando...' enquanto espera a resposta", async () => {
    let concluir: (valor: { email: string }) => void = () => undefined;
    vi.mocked(entrarComoModerador).mockReturnValue(new Promise((resolver) => (concluir = resolver)));
    renderizar();

    await preencherEEnviar();

    const botao = await screen.findByRole("button", { name: /Entrando/ });
    expect(botao).toBeDisabled();

    concluir({ email: "prof@feevale.br" });
    expect(await screen.findByText("Minhas salas")).toBeInTheDocument();
  });

  it("limpa o erro anterior ao tentar de novo", async () => {
    vi.mocked(entrarComoModerador)
      .mockRejectedValueOnce(new ErroApi({ status: 401, codigo: "ERRO_HTTP", tipo: "unauthorized", mensagem: "E-mail ou senha incorretos." }))
      .mockResolvedValueOnce({ email: "prof@feevale.br" });
    renderizar();

    await preencherEEnviar();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Minhas salas")).toBeInTheDocument();
  });
});
