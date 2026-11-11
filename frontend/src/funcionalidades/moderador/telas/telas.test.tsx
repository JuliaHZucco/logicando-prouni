import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { EstadoSala, LinhaRanking } from "../../salas/tipos";
import { criarEstado, criarPergunta, criarResultado } from "../../../testes/fabricas";
import { renderizarComRotas } from "../../../testes/renderizar";
import ModalEncerrarSala from "./ModalEncerrarSala";
import { descreverCronometro, descreverModoDaSala } from "./propsDaSala";
import TelaEncerradaModerador from "./TelaEncerradaModerador";
import TelaEsperaModerador from "./TelaEsperaModerador";
import TelaPerguntaModerador from "./TelaPerguntaModerador";
import TelaRankingModerador from "./TelaRankingModerador";
import TelaResultadoModerador from "./TelaResultadoModerador";

function propsBase(parcial: Partial<EstadoSala> = {}, ocupado = false) {
  return { estado: criarEstado({ souModerador: true, ...parcial }), ocupado, aoAcionar: vi.fn(), aoPedirEncerramento: vi.fn() };
}

const mostrar = (elemento: React.ReactElement) => renderizarComRotas("/", { "/": elemento });

const ranking: LinhaRanking[] = [
  { participanteId: 1, apelido: "Ana", acertos: 3, posicao: 1, perguntasExibidas: 3, aproveitamento: 100 },
  { participanteId: 2, apelido: "Bruno", acertos: 1, posicao: 2, perguntasExibidas: 3, aproveitamento: 33 },
];

describe("descreverModoDaSala e descreverCronometro", () => {
  it("descreve cada modo de sala", () => {
    expect(descreverModoDaSala(criarEstado({ modo: "aleatorio" }))).toBe("Aleatório");
    expect(descreverModoDaSala(criarEstado({ modo: "categoria", categorias: ["Prazos"] }))).toBe("Prazos");
    expect(descreverModoDaSala(criarEstado({ modo: "categoria", categorias: [] }))).toBe("Uma categoria");
    expect(descreverModoDaSala(criarEstado({ modo: "misto", categorias: ["Prazos", "Bolsas"] }))).toBe("Misto (Prazos, Bolsas)");
  });

  it("descreve o cronômetro", () => {
    expect(descreverCronometro(criarEstado({ segundosPorPergunta: null }))).toBe("Sem cronômetro");
    expect(descreverCronometro(criarEstado({ segundosPorPergunta: 30 }))).toBe("30 segundos por pergunta");
  });
});

describe("TelaEsperaModerador", () => {
  it("mostra o nome, o código, a rodada e o resumo da sala", () => {
    mostrar(<TelaEsperaModerador {...propsBase({ nome: "Turma 1", rodada: 2, quantidadePerguntas: 4, segundosPorPergunta: 30 })} />);

    expect(screen.getByText("TURMA 1")).toBeInTheDocument();
    expect(screen.getByText("CÓDIGO DA SALA · RODADA 2")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText(/Aleatório/)).toBeInTheDocument();
    expect(screen.getByText(/30 segundos por pergunta/)).toBeInTheDocument();
  });

  it("'Iniciar partida' avança e 'Encerrar sala' pede a confirmação", async () => {
    const props = propsBase();
    mostrar(<TelaEsperaModerador {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "Iniciar partida" }));
    await userEvent.click(screen.getByRole("button", { name: "Encerrar sala" }));

    expect(props.aoAcionar).toHaveBeenCalledExactlyOnceWith("Avancar");
    expect(props.aoPedirEncerramento).toHaveBeenCalledOnce();
  });

  it("sem participantes na sala não deixa iniciar a partida", () => {
    mostrar(<TelaEsperaModerador {...propsBase({ participantes: [], totalParticipantes: 0 })} />);

    expect(screen.getByRole("button", { name: "Iniciar partida" })).toBeDisabled();
    expect(screen.getByText("Aguarde pelo menos um participante entrar para iniciar.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Encerrar sala" })).toBeEnabled();
  });

  it("trava os botões enquanto uma ação está em andamento", () => {
    mostrar(<TelaEsperaModerador {...propsBase({}, true)} />);

    expect(screen.getByRole("button", { name: "Iniciar partida" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Encerrar sala" })).toBeDisabled();
  });

  it("lista quem está na sala, no singular e no plural", () => {
    const participantes = [
      { id: 1, apelido: "Ana" },
      { id: 2, apelido: "Bruno" },
    ];
    const { unmount } = mostrar(<TelaEsperaModerador {...propsBase({ participantes: [participantes[0]], totalParticipantes: 1 })} />);
    expect(screen.getByText("1 participante")).toBeInTheDocument();
    unmount();

    mostrar(<TelaEsperaModerador {...propsBase({ participantes, totalParticipantes: 2 })} />);

    expect(screen.getByText("2 participantes")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });
});

describe("TelaPerguntaModerador", () => {
  it("mostra a pergunta, as alternativas e quantos já responderam", () => {
    const pergunta = criarPergunta({ ordem: 2, total: 3, respondidas: 3 });
    const { container } = mostrar(<TelaPerguntaModerador {...propsBase({ totalParticipantes: 4, pergunta })} pergunta={pergunta} />);

    expect(screen.getByText("Pergunta 2 de 3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: pergunta.enunciado })).toBeInTheDocument();
    expect(screen.getByText("Opção D")).toBeInTheDocument();
    expect(container.querySelector(".moderador-contador")).toHaveTextContent("3 de 4");
    expect(container.querySelector(".sala-grafico-barra")).toHaveStyle({ width: "75%" });
  });

  it("não quebra a barra de respostas quando ainda não há participantes", () => {
    const pergunta = criarPergunta();
    const { container } = mostrar(<TelaPerguntaModerador {...propsBase({ totalParticipantes: 0 })} pergunta={pergunta} />);

    expect(container.querySelector(".sala-grafico-barra")).toHaveStyle({ width: "0%" });
  });

  it("mostra o cronômetro quando a pergunta tem tempo", () => {
    const pergunta = criarPergunta({ segundosRestantes: 45 });
    mostrar(<TelaPerguntaModerador {...propsBase({ segundosPorPergunta: 60 })} pergunta={pergunta} />);

    expect(screen.getByText("0:45")).toBeInTheDocument();
  });

  it("'Encerrar pergunta agora' fecha a pergunta e 'Encerrar sala' pede confirmação", async () => {
    const props = propsBase();
    mostrar(<TelaPerguntaModerador {...props} pergunta={criarPergunta()} />);

    await userEvent.click(screen.getByRole("button", { name: "Encerrar pergunta agora" }));
    await userEvent.click(screen.getByRole("button", { name: "Encerrar sala" }));

    expect(props.aoAcionar).toHaveBeenCalledExactlyOnceWith("EncerrarPergunta");
    expect(props.aoPedirEncerramento).toHaveBeenCalledOnce();
  });

  it("avisa que a alternativa correta fica oculta", () => {
    mostrar(<TelaPerguntaModerador {...propsBase()} pergunta={criarPergunta()} />);

    expect(screen.getByText(/A alternativa correta fica oculta/)).toBeInTheDocument();
  });
});

describe("TelaResultadoModerador", () => {
  it("mostra as respostas da sala, os totais e a explicação", () => {
    const pergunta = criarPergunta();
    mostrar(<TelaResultadoModerador {...propsBase()} pergunta={pergunta} resultado={criarResultado()} />);

    expect(screen.getByText("Resultado da pergunta 1 de 3")).toBeInTheDocument();
    expect(screen.getByText("RESPOSTAS DA SALA (3)")).toBeInTheDocument();
    expect(screen.getByText(/B · Opção B ✓ correta/)).toBeInTheDocument();
    expect(screen.getByText("2 (67%)")).toBeInTheDocument();
    expect(screen.getByText("Acertos: 2 · Erros: 1 · Não responderam: 1")).toBeInTheDocument();
    expect(screen.getByText(/limite do programa/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Respostas da sala por alternativa" })).toBeInTheDocument();
  });

  it("'Próxima pergunta' avança a sala", async () => {
    const props = propsBase();
    mostrar(<TelaResultadoModerador {...props} pergunta={criarPergunta({ ordem: 1, total: 3 })} resultado={criarResultado()} />);

    await userEvent.click(screen.getByRole("button", { name: "Próxima pergunta" }));

    expect(props.aoAcionar).toHaveBeenCalledExactlyOnceWith("Avancar");
  });

  it("na última pergunta o botão leva ao ranking final", () => {
    mostrar(<TelaResultadoModerador {...propsBase()} pergunta={criarPergunta({ ordem: 3, total: 3 })} resultado={criarResultado()} />);

    expect(screen.getByRole("button", { name: "Última pergunta: ver ranking final" })).toBeInTheDocument();
  });

  it("'Encerrar sala' pede confirmação", async () => {
    const props = propsBase();
    mostrar(<TelaResultadoModerador {...props} pergunta={criarPergunta()} resultado={criarResultado()} />);

    await userEvent.click(screen.getByRole("button", { name: "Encerrar sala" }));

    expect(props.aoPedirEncerramento).toHaveBeenCalledOnce();
  });
});

describe("TelaRankingModerador", () => {
  it("mostra o título com o número de perguntas, no singular e no plural", () => {
    const { unmount } = mostrar(<TelaRankingModerador {...propsBase({ quantidadePerguntas: 1, ranking })} />);
    expect(screen.getByRole("heading", { name: "Ranking final · 1 pergunta" })).toBeInTheDocument();
    unmount();

    mostrar(<TelaRankingModerador {...propsBase({ quantidadePerguntas: 3, ranking })} />);

    expect(screen.getByRole("heading", { name: "Ranking final · 3 perguntas" })).toBeInTheDocument();
  });

  it("mostra o pódio e o caminho para o ranking geral", () => {
    mostrar(<TelaRankingModerador {...propsBase({ ranking })} />);

    expect(screen.getByRole("list", { name: /Pódio/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver ranking geral" })).toHaveAttribute("href", "/moderador/sala/ABC123/ranking");
  });

  it("'Jogar novamente' abre a próxima rodada e explica o que acontece", async () => {
    const props = propsBase({ rodada: 1, ranking });
    mostrar(<TelaRankingModerador {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "Jogar novamente" }));

    expect(props.aoAcionar).toHaveBeenCalledExactlyOnceWith("JogarNovamente");
    expect(screen.getByText(/Abre a rodada 2 na mesma sala/)).toBeInTheDocument();
  });

  it("'Encerrar sala' pede confirmação", async () => {
    const props = propsBase({ ranking });
    mostrar(<TelaRankingModerador {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "Encerrar sala" }));

    expect(props.aoPedirEncerramento).toHaveBeenCalledOnce();
  });
});

describe("TelaEncerradaModerador", () => {
  it("mostra o resumo da sala com os totais no plural", () => {
    mostrar(<TelaEncerradaModerador estado={criarEstado({ nome: "Turma 1", totalParticipantes: 8, quantidadePerguntas: 5, rodada: 2, ranking })} />);

    expect(screen.getByRole("heading", { name: "Sala encerrada" })).toBeInTheDocument();
    expect(screen.getByText("TURMA 1 · SALA ABC123")).toBeInTheDocument();
    expect(screen.getByText("participantes")).toBeInTheDocument();
    expect(screen.getByText("perguntas")).toBeInTheDocument();
    expect(screen.getByText("rodadas")).toBeInTheDocument();
  });

  it("usa o singular quando há só um de cada", () => {
    mostrar(<TelaEncerradaModerador estado={criarEstado({ totalParticipantes: 1, quantidadePerguntas: 1, rodada: 1, ranking })} />);

    expect(screen.getByText("participante")).toBeInTheDocument();
    expect(screen.getByText("pergunta")).toBeInTheDocument();
    expect(screen.getByText("rodada")).toBeInTheDocument();
  });

  it("leva ao ranking geral e de volta às salas", () => {
    mostrar(<TelaEncerradaModerador estado={criarEstado({ ranking })} />);

    expect(screen.getByRole("link", { name: "Ver ranking geral" })).toHaveAttribute("href", "/moderador/sala/ABC123/ranking");
    expect(screen.getByRole("link", { name: "Voltar para minhas salas" })).toHaveAttribute("href", "/moderador/salas");
  });
});

describe("ModalEncerrarSala", () => {
  it("é uma janela de confirmação com o código da sala", () => {
    renderizarModal();

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Encerrar a sala ABC123?");
  });

  it("cancelar e confirmar chamam cada função", async () => {
    const aoCancelar = vi.fn();
    const aoConfirmar = vi.fn();
    renderizarModal({ aoCancelar, aoConfirmar });

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await userEvent.click(screen.getByRole("button", { name: "Encerrar sala" }));

    expect(aoCancelar).toHaveBeenCalledOnce();
    expect(aoConfirmar).toHaveBeenCalledOnce();
  });

  it("trava os dois botões enquanto está ocupado", () => {
    renderizarModal({ ocupado: true });

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Encerrar sala" })).toBeDisabled();
  });
});

function renderizarModal(parcial: Partial<React.ComponentProps<typeof ModalEncerrarSala>> = {}) {
  return mostrar(<ModalEncerrarSala codigo="ABC123" ocupado={false} aoCancelar={vi.fn()} aoConfirmar={vi.fn()} {...parcial} />);
}
