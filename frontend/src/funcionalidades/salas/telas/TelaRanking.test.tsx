import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { criarEstado } from "../../../testes/fabricas";
import BarraDaSala from "../componentes/BarraDaSala";
import type { LinhaRanking } from "../tipos";
import TelaRanking from "./TelaRanking";

const ranking: LinhaRanking[] = [
  { participanteId: 1, apelido: "Ana", acertos: 3, posicao: 1, perguntasExibidas: 3, aproveitamento: 100 },
  { participanteId: 2, apelido: "Bruno", acertos: 1, posicao: 2, perguntasExibidas: 3, aproveitamento: 33 },
];

describe("TelaRanking", () => {
  it("no fim do quiz mostra o título e o aviso sobre empates", () => {
    render(<TelaRanking estado={criarEstado({ status: "ranking", quantidadePerguntas: 3, ranking })} />);

    expect(screen.getByText("FIM DO QUIZ · 3 PERGUNTAS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ranking final" })).toBeInTheDocument();
    expect(screen.getByText("Aparecem só os três primeiros. Empates dividem a posição.")).toBeInTheDocument();
  });

  it("usa o singular quando o quiz teve uma pergunta", () => {
    render(<TelaRanking estado={criarEstado({ status: "ranking", quantidadePerguntas: 1, ranking })} />);

    expect(screen.getByText("FIM DO QUIZ · 1 PERGUNTA")).toBeInTheDocument();
  });

  it("mostra a posição de quem está jogando", () => {
    const minha = ranking[1];
    render(<TelaRanking estado={criarEstado({ status: "ranking", ranking, minhaPosicao: minha })} />);

    expect(screen.getByText("SUA POSIÇÃO")).toBeInTheDocument();
    expect(screen.getByText("Bruno · 1 de 3 · 33%")).toBeInTheDocument();
    expect(screen.getByText("2º", { selector: ".sala-posicao-numero" })).toBeInTheDocument();
  });

  it("não mostra a posição quando a pessoa não está no ranking", () => {
    render(<TelaRanking estado={criarEstado({ status: "ranking", ranking, minhaPosicao: null })} />);

    expect(screen.queryByText("SUA POSIÇÃO")).not.toBeInTheDocument();
  });

  it("com a sala encerrada agradece e detalha o resultado", () => {
    const minha = ranking[0];
    render(<TelaRanking estado={criarEstado({ status: "encerrada", totalParticipantes: 8, ranking, minhaPosicao: minha })} />);

    expect(screen.getByText("A SALA FOI ENCERRADA")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Obrigado por participar!" })).toBeInTheDocument();
    expect(screen.getByText("SEU RESULTADO")).toBeInTheDocument();
    expect(screen.getByText(/100% de aproveitamento · 1º lugar de 8/)).toBeInTheDocument();
  });

  it("omite o aproveitamento quando ele ainda não existe", () => {
    const semAproveitamento = { ...ranking[0], aproveitamento: null, perguntasExibidas: 0 };
    render(<TelaRanking estado={criarEstado({ status: "ranking", ranking: [semAproveitamento], minhaPosicao: semAproveitamento })} />);

    expect(screen.getByText("Ana · 3 de 0")).toBeInTheDocument();
  });
});

describe("BarraDaSala", () => {
  it("mostra o código da sala e o apelido com a inicial em maiúscula", () => {
    render(<BarraDaSala codigo="ABC123" apelido="bruno" />);

    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("bruno")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByAltText("Logo da Universidade Feevale")).toBeInTheDocument();
  });
});
