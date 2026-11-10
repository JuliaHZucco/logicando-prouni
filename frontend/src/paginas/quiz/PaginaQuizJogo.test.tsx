import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { buscarResultadoDaPartida, repetirPartida, responderPergunta } from "../../funcionalidades/quiz/servicos/quizApi";
import type { ResultadoPartida, ResultadoResposta } from "../../funcionalidades/quiz/tipos";
import { tocarSomFinalizacao, tocarSomResposta } from "../../utilitarios/sons";
import { criarPartida } from "../../testes/fabricas";
import { renderizarComRotas } from "../../testes/renderizar";
import PaginaQuizJogo from "./PaginaQuizJogo";

vi.mock("../../funcionalidades/quiz/servicos/quizApi", () => ({
  responderPergunta: vi.fn(),
  buscarResultadoDaPartida: vi.fn(),
  repetirPartida: vi.fn(),
}));
vi.mock("../../utilitarios/sons", () => ({ tocarSomResposta: vi.fn(), tocarSomFinalizacao: vi.fn() }));

const acerto: ResultadoResposta = { correta: true, alternativaCorretaId: 102, explicacao: "Porque a renda é limitada.", baseDuvidaId: "eleg-1" };
const erro: ResultadoResposta = { correta: false, alternativaCorretaId: 202, explicacao: "As inscrições abrem depois do Enem.", baseDuvidaId: "praz-1" };

function renderizar(partida = criarPartida()) {
  return renderizarComRotas(
    { pathname: "/quiz/jogar", state: { partida } },
    { "/quiz/jogar": <PaginaQuizJogo />, "/quiz": <div>Menu do quiz</div> },
  );
}

const escolher = (texto: RegExp) => userEvent.click(screen.getByRole("button", { name: texto }));

async function jogarAteOResultado() {
  vi.mocked(responderPergunta).mockResolvedValueOnce(acerto).mockResolvedValueOnce(erro);
  await escolher(/Resposta 1B/);
  await userEvent.click(await screen.findByRole("button", { name: /Próxima pergunta/ }));
  await escolher(/Resposta 2A/);
  await userEvent.click(await screen.findByRole("button", { name: /Ver resultado/ }));
}

describe("PaginaQuizJogo", () => {
  it("volta ao menu do quiz quando não há partida em andamento", () => {
    renderizarComRotas("/quiz/jogar", { "/quiz/jogar": <PaginaQuizJogo />, "/quiz": <div>Menu do quiz</div> });

    expect(screen.getByText("Menu do quiz")).toBeInTheDocument();
  });

  it("mostra a primeira pergunta com a categoria e as quatro alternativas", () => {
    renderizar();

    expect(screen.getByText("PERGUNTA 1 DE 2")).toBeInTheDocument();
    expect(screen.getByText("Elegibilidade")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quem pode participar do ProUni?" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("envia a resposta escolhida e mostra o acerto com a explicação", async () => {
    vi.mocked(responderPergunta).mockResolvedValue(acerto);
    renderizar();

    await escolher(/Resposta 1B/);

    expect(responderPergunta).toHaveBeenCalledExactlyOnceWith(7, "eleg-1", 102);
    expect(await screen.findByRole("status")).toHaveTextContent("Você acertou!");
    expect(screen.getByText(/Porque a renda é limitada\./)).toBeInTheDocument();
    expect(tocarSomResposta).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.getByRole("link", { name: "Ler a dúvida completa" })).toHaveAttribute("href", "/categoria/elegibilidade?duvida=eleg-1");
  });

  it("no erro mostra qual foi a resposta marcada e qual era a correta", async () => {
    vi.mocked(responderPergunta).mockResolvedValue({ ...acerto, correta: false });
    renderizar();

    await escolher(/Resposta 1A/);

    expect(await screen.findByRole("status")).toHaveTextContent("Não foi dessa vez.");
    expect(screen.getByRole("button", { name: /Resposta 1A/ })).toHaveTextContent("sua resposta");
    expect(screen.getByRole("button", { name: /Resposta 1B/ })).toHaveTextContent("correta");
    expect(tocarSomResposta).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("trava as alternativas depois de responder", async () => {
    vi.mocked(responderPergunta).mockResolvedValue(acerto);
    renderizar();

    await escolher(/Resposta 1B/);
    await screen.findByRole("status");

    for (const alternativa of screen.getAllByRole("button", { name: /Resposta 1/ })) expect(alternativa).toBeDisabled();
  });

  it("mostra o erro do servidor e deixa tentar de novo", async () => {
    vi.mocked(responderPergunta).mockRejectedValueOnce(new Error("Esta pergunta já foi respondida.")).mockResolvedValueOnce(acerto);
    renderizar();

    await escolher(/Resposta 1B/);
    expect(await screen.findByRole("alert")).toHaveTextContent("Esta pergunta já foi respondida.");
    await escolher(/Resposta 1B/);

    expect(await screen.findByRole("status")).toHaveTextContent("Você acertou!");
  });

  it("avança para a próxima pergunta e avisa quando é a última", async () => {
    vi.mocked(responderPergunta).mockResolvedValue(acerto);
    renderizar();

    await escolher(/Resposta 1B/);
    await userEvent.click(await screen.findByRole("button", { name: /Próxima pergunta/ }));

    expect(screen.getByText("PERGUNTA 2 DE 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quando abrem as inscrições?" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await escolher(/Resposta 2B/);
    expect(await screen.findByRole("button", { name: /Ver resultado/ })).toBeInTheDocument();
  });

  it("a barra de progresso acompanha as perguntas concluídas", async () => {
    vi.mocked(responderPergunta).mockResolvedValue(acerto);
    const { container } = renderizar();
    expect(container.querySelector(".quiz-progresso")).toHaveStyle({ width: "0%" });

    await escolher(/Resposta 1B/);
    await userEvent.click(await screen.findByRole("button", { name: /Próxima pergunta/ }));

    expect(container.querySelector(".quiz-progresso")).toHaveStyle({ width: "50%" });
  });

  it("ao terminar mostra o resultado calculado pelo servidor e as perguntas erradas para reler", async () => {
    const resultado: ResultadoPartida = {
      partidaId: 7,
      finalizada: true,
      totalPerguntas: 2,
      acertos: 1,
      percentualAcerto: 50,
      aproveitamentoPositivo: false,
      itens: [
        { ordem: 1, duvidaId: "eleg-1", duvidaPergunta: "Quem pode participar do ProUni?", categoriaId: "elegibilidade", baseDuvidaId: "eleg-1", correta: true },
        { ordem: 2, duvidaId: "praz-1", duvidaPergunta: "Quando abrem as inscrições?", categoriaId: "prazos", baseDuvidaId: "praz-1", correta: false },
      ],
    };
    vi.mocked(buscarResultadoDaPartida).mockResolvedValue(resultado);
    renderizar();

    await jogarAteOResultado();

    expect(await screen.findByText("QUIZ CONCLUÍDO")).toBeInTheDocument();
    expect(buscarResultadoDaPartida).toHaveBeenCalledExactlyOnceWith(7);
    expect(screen.getByRole("heading", { name: "1 de 2" })).toBeInTheDocument();
    expect(screen.getByText(/Você acertou 50% das perguntas\./)).toHaveTextContent("Tente novamente para melhorar seu resultado.");
    expect(screen.getAllByRole("link", { name: "Reler dúvida" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Reler dúvida" })).toHaveAttribute("href", "/categoria/prazos?duvida=praz-1");
    expect(tocarSomFinalizacao).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("parabeniza quando o aproveitamento é positivo", async () => {
    vi.mocked(buscarResultadoDaPartida).mockResolvedValue({
      partidaId: 7,
      finalizada: true,
      totalPerguntas: 2,
      acertos: 2,
      percentualAcerto: 100,
      aproveitamentoPositivo: true,
      itens: [],
    });
    renderizar();

    await jogarAteOResultado();

    expect(await screen.findByText(/Muito bem!/)).toBeInTheDocument();
    expect(tocarSomFinalizacao).toHaveBeenCalledWith(true);
  });

  it("se o servidor não entrega o resultado, usa a contagem feita na própria tela", async () => {
    vi.mocked(buscarResultadoDaPartida).mockRejectedValue(new Error("sem rede"));
    renderizar();

    await jogarAteOResultado();

    expect(await screen.findByRole("heading", { name: "1 de 2" })).toBeInTheDocument();
    expect(screen.getByText(/Você acertou 50% das perguntas\./)).toBeInTheDocument();
    expect(tocarSomFinalizacao).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("'Jogar de novo' pede uma nova partida com as mesmas perguntas e recomeça", async () => {
    vi.mocked(buscarResultadoDaPartida).mockRejectedValue(new Error("sem rede"));
    vi.mocked(repetirPartida).mockResolvedValue({ ...criarPartida(), partidaId: 8 });
    renderizar();
    await jogarAteOResultado();

    await userEvent.click(await screen.findByRole("button", { name: /Jogar de novo/ }));

    expect(repetirPartida).toHaveBeenCalledExactlyOnceWith(7);
    expect(await screen.findByText("PERGUNTA 1 DE 2")).toBeInTheDocument();
    vi.mocked(responderPergunta).mockResolvedValue(acerto);
    await escolher(/Resposta 1B/);
    expect(responderPergunta).toHaveBeenLastCalledWith(8, "eleg-1", 102);
  });

  it("mostra o erro quando não consegue reiniciar o quiz", async () => {
    vi.mocked(buscarResultadoDaPartida).mockRejectedValue(new Error("sem rede"));
    vi.mocked(repetirPartida).mockRejectedValue(new Error("Partida não encontrada."));
    renderizar();
    await jogarAteOResultado();

    await userEvent.click(await screen.findByRole("button", { name: /Jogar de novo/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Partida não encontrada.");
    expect(screen.getByText("QUIZ CONCLUÍDO")).toBeInTheDocument();
  });
});
