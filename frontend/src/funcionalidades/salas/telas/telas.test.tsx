import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { criarEstado, criarPergunta, criarResultado } from "../../../testes/fabricas";
import TelaEspera from "./TelaEspera";
import TelaPergunta from "./TelaPergunta";
import TelaResultado from "./TelaResultado";

describe("TelaPergunta", () => {
  it("mostra o enunciado, a posição da pergunta e as quatro alternativas", () => {
    const pergunta = criarPergunta({ ordem: 2, total: 5 });
    render(<TelaPergunta estado={criarEstado({ status: "pergunta_aberta", pergunta })} pergunta={pergunta} aoResponder={vi.fn()} />);

    expect(screen.getByText("PERGUNTA 2 DE 5")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: pergunta.enunciado })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("envia a alternativa escolhida", async () => {
    const aoResponder = vi.fn().mockResolvedValue({ ok: true });
    const pergunta = criarPergunta();
    render(<TelaPergunta estado={criarEstado({ status: "pergunta_aberta", pergunta })} pergunta={pergunta} aoResponder={aoResponder} />);

    await userEvent.click(screen.getByRole("button", { name: /Opção B/ }));

    expect(aoResponder).toHaveBeenCalledExactlyOnceWith(12);
  });

  it("mostra o motivo quando o servidor recusa a resposta", async () => {
    const aoResponder = vi.fn().mockResolvedValue({ ok: false, erro: "O tempo desta pergunta acabou." });
    const pergunta = criarPergunta();
    render(<TelaPergunta estado={criarEstado({ status: "pergunta_aberta", pergunta })} pergunta={pergunta} aoResponder={aoResponder} />);

    await userEvent.click(screen.getByRole("button", { name: /Opção A/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("O tempo desta pergunta acabou.");
  });

  it("usa uma mensagem padrão quando a recusa vem sem texto", async () => {
    const aoResponder = vi.fn().mockResolvedValue({ ok: false });
    const pergunta = criarPergunta();
    render(<TelaPergunta estado={criarEstado({ status: "pergunta_aberta", pergunta })} pergunta={pergunta} aoResponder={aoResponder} />);

    await userEvent.click(screen.getByRole("button", { name: /Opção A/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Resposta não aceita.");
  });

  it("depois de responder mostra a alternativa marcada e esconde as opções", () => {
    const pergunta = criarPergunta();
    const estado = criarEstado({ status: "pergunta_aberta", pergunta, minhaAlternativaId: 13 });
    render(<TelaPergunta estado={estado} pergunta={pergunta} aoResponder={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Resposta enviada!" })).toBeInTheDocument();
    expect(screen.getByText("Opção C")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("mostra o cronômetro quando a pergunta tem tempo", () => {
    const pergunta = criarPergunta({ segundosRestantes: 90 });
    const estado = criarEstado({ status: "pergunta_aberta", pergunta, segundosPorPergunta: 90 });
    render(<TelaPergunta estado={estado} pergunta={pergunta} aoResponder={vi.fn()} />);

    expect(screen.getByText("1:30")).toBeInTheDocument();
  });

  it("não mostra cronômetro quando a pergunta não tem tempo", () => {
    const pergunta = criarPergunta({ segundosRestantes: null });
    render(<TelaPergunta estado={criarEstado({ status: "pergunta_aberta", pergunta })} pergunta={pergunta} aoResponder={vi.fn()} />);

    expect(screen.queryByText(/^\d+:\d{2}$/)).not.toBeInTheDocument();
  });
});

describe("TelaResultado", () => {
  it("parabeniza quem acertou", () => {
    render(<TelaResultado estado={criarEstado({ status: "resultado_pergunta", minhaAlternativaId: 12 })} resultado={criarResultado()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Você acertou!");
  });

  it("avisa quem errou", () => {
    render(<TelaResultado estado={criarEstado({ status: "resultado_pergunta", minhaAlternativaId: 11 })} resultado={criarResultado()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Não foi dessa vez.");
  });

  it("avisa quem não respondeu", () => {
    render(<TelaResultado estado={criarEstado({ status: "resultado_pergunta", minhaAlternativaId: null })} resultado={criarResultado()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Você não respondeu.");
  });

  it("revela a letra da alternativa correta e a explicação", () => {
    render(<TelaResultado estado={criarEstado({ status: "resultado_pergunta" })} resultado={criarResultado()} />);

    expect(screen.getByText(/Resposta correta: B\./)).toBeInTheDocument();
    expect(screen.getByText(/limite do programa/)).toBeInTheDocument();
  });

  it("marca a resposta do participante no gráfico", () => {
    render(<TelaResultado estado={criarEstado({ status: "resultado_pergunta", minhaAlternativaId: 11 })} resultado={criarResultado()} />);

    expect(screen.getAllByText("sua resposta")).toHaveLength(1);
    expect(screen.getByText(/1 \(33%\)/)).toBeInTheDocument();
    expect(screen.getByText(/2 \(67%\) ✓/)).toBeInTheDocument();
  });

  it("lista quantos não responderam só quando houve alguém", () => {
    const { rerender } = render(<TelaResultado estado={criarEstado()} resultado={criarResultado({ naoResponderam: 2 })} />);
    expect(screen.getByText("Não responderam: 2")).toBeInTheDocument();

    rerender(<TelaResultado estado={criarEstado()} resultado={criarResultado({ naoResponderam: 0 })} />);

    expect(screen.queryByText(/Não responderam/)).not.toBeInTheDocument();
  });
});

describe("TelaEspera", () => {
  it("na primeira rodada pede para aguardar o moderador", () => {
    render(<TelaEspera estado={criarEstado({ rodada: 1 })} />);

    expect(screen.getByRole("heading", { name: "Aguardando o moderador iniciar" })).toBeInTheDocument();
  });

  it("nas rodadas seguintes avisa que o placar recomeçou", () => {
    render(<TelaEspera estado={criarEstado({ rodada: 2 })} />);

    expect(screen.getByText("RODADA 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O moderador abriu uma nova rodada" })).toBeInTheDocument();
  });

  it("na primeira rodada oferece o botão para sair da sala", async () => {
    const aoSair = vi.fn();
    render(<TelaEspera estado={criarEstado({ rodada: 1 })} aoSair={aoSair} />);

    await userEvent.click(screen.getByRole("button", { name: /Voltar e sair da sala/ }));

    expect(aoSair).toHaveBeenCalledOnce();
  });

  it("nas rodadas seguintes também oferece o botão de sair", () => {
    render(<TelaEspera estado={criarEstado({ rodada: 2 })} aoSair={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Voltar e sair da sala/ })).toBeInTheDocument();
  });

  it("conta os participantes no singular e no plural", () => {
    const { rerender } = render(<TelaEspera estado={criarEstado({ totalParticipantes: 1 })} />);
    expect(screen.getByText("1 participante")).toBeInTheDocument();

    rerender(<TelaEspera estado={criarEstado({ totalParticipantes: 3 })} />);

    expect(screen.getByText("3 participantes")).toBeInTheDocument();
  });

  it("destaca o próprio participante na lista", () => {
    const participantes = [
      { id: 1, apelido: "Ana" },
      { id: 2, apelido: "Bruno" },
    ];
    render(<TelaEspera estado={criarEstado({ participantes, totalParticipantes: 2, participante: participantes[1] })} />);

    expect(screen.getByText("Bruno (você)")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });
});
