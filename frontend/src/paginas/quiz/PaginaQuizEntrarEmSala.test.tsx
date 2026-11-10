import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { entrarNaSala } from "../../funcionalidades/salas/servicos/salasApi";
import { ErroApi } from "../../utilitarios/api";
import PaginaQuizEntrarEmSala from "./PaginaQuizEntrarEmSala";

vi.mock("../../funcionalidades/salas/servicos/salasApi", () => ({
  entrarNaSala: vi.fn(),
}));

function renderizar() {
  return render(
    <MemoryRouter initialEntries={["/quiz/sala"]}>
      <Routes>
        <Route path="/quiz/sala" element={<PaginaQuizEntrarEmSala />} />
        <Route path="/sala/:codigo" element={<div>Tela da sala</div>} />
        <Route path="/sala/:codigo/apelido" element={<div>Escolha o apelido</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function digitarEEntrar(codigo: string) {
  await userEvent.type(screen.getByLabelText("CÓDIGO DA SALA"), codigo);
  await userEvent.click(screen.getByRole("button", { name: "Entrar na sala" }));
}

function erro(status: number, codigo: string, mensagem: string) {
  return new ErroApi({ status, codigo, tipo: "error", mensagem });
}

describe("PaginaQuizEntrarEmSala", () => {
  it("mantém o botão desabilitado enquanto o código está vazio", () => {
    renderizar();

    expect(screen.getByRole("button", { name: "Entrar na sala" })).toBeDisabled();
  });

  it("converte o código digitado para maiúsculas", async () => {
    renderizar();

    await userEvent.type(screen.getByLabelText("CÓDIGO DA SALA"), "abc12x");

    expect(screen.getByLabelText("CÓDIGO DA SALA")).toHaveValue("ABC12X");
  });

  it("não aceita mais de 6 caracteres", async () => {
    renderizar();

    await userEvent.type(screen.getByLabelText("CÓDIGO DA SALA"), "ABCDEFGH");

    expect(screen.getByLabelText("CÓDIGO DA SALA")).toHaveValue("ABCDEF");
  });

  it("entra direto na sala quando o visitante já é participante", async () => {
    vi.mocked(entrarNaSala).mockResolvedValue({ participante: { id: 1, apelido: "Ana" }, reconectado: true });
    renderizar();

    await digitarEEntrar("abc123");

    expect(await screen.findByText("Tela da sala")).toBeInTheDocument();
    expect(entrarNaSala).toHaveBeenCalledExactlyOnceWith("ABC123", "");
  });

  it("leva para a escolha do apelido quando a API pede o apelido", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(erro(400, "PrecisaApelido", "Escolha um apelido de 1 a 20 caracteres."));
    renderizar();

    await digitarEEntrar("ABC123");

    expect(await screen.findByText("Escolha o apelido")).toBeInTheDocument();
  });

  it("avisa quando a sala não existe", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(erro(404, "ERRO_HTTP", "Código de sala não encontrado."));
    renderizar();

    await digitarEEntrar("ZZZZZZ");

    expect(await screen.findByRole("alert")).toHaveTextContent("Sala não encontrada. Confira o código com o moderador.");
  });

  it("avisa quando a sala já foi encerrada", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(erro(409, "SalaEncerrada", "Esta sala já terminou e não aceita novas entradas."));
    renderizar();

    await digitarEEntrar("ABC123");

    expect(await screen.findByRole("alert")).toHaveTextContent("Esta sala já foi encerrada.");
  });

  it("mostra a mensagem do servidor para outros erros, como o limite de tentativas", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(erro(429, "LimiteExcedido", "Muitas requisições. Aguarde um pouco e tente novamente."));
    renderizar();

    await digitarEEntrar("ABC123");

    expect(await screen.findByRole("alert")).toHaveTextContent("Muitas requisições. Aguarde um pouco e tente novamente.");
  });

  it("'Tentar de novo' limpa o erro e o código", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(erro(404, "ERRO_HTTP", "Código de sala não encontrado."));
    renderizar();
    await digitarEEntrar("ZZZZZZ");
    await screen.findByRole("alert");

    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("CÓDIGO DA SALA")).toHaveValue("");
  });

  it("apagar ou editar o código remove a mensagem de erro", async () => {
    vi.mocked(entrarNaSala).mockRejectedValue(erro(404, "ERRO_HTTP", "Código de sala não encontrado."));
    renderizar();
    await digitarEEntrar("ZZZZZZ");
    await screen.findByRole("alert");

    await userEvent.type(screen.getByLabelText("CÓDIGO DA SALA"), "{Backspace}");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
