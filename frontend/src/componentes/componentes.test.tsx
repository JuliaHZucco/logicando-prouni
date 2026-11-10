import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LinhaRanking } from "../funcionalidades/salas/tipos";
import Alerta from "./Alerta";
import BarraProgresso from "./BarraProgresso";
import GraficoDeFatias from "./GraficoDeFatias";
import Podio from "./Podio";

function linha(posicao: number, apelido: string, acertos: number, perguntasExibidas = 5, aproveitamento: number | null = 80): LinhaRanking {
  return { participanteId: posicao, apelido, acertos, posicao, perguntasExibidas, aproveitamento };
}

describe("Alerta", () => {
  it("mostra a mensagem como alerta de erro por padrão", () => {
    render(<Alerta mensagem="Algo deu errado." />);

    const alerta = screen.getByRole("alert");
    expect(alerta).toHaveTextContent("Algo deu errado.");
    expect(alerta).toHaveClass("alert-danger");
  });

  it("usa a variante informada", () => {
    render(<Alerta mensagem="Tudo certo." variante="success" />);

    expect(screen.getByRole("alert")).toHaveClass("alert-success");
  });
});

describe("BarraProgresso", () => {
  it("calcula o percentual e descreve o progresso", () => {
    render(<BarraProgresso progressoValorAtual={3} progressoValorTotal={4} />);

    const barra = screen.getByRole("progressbar");
    expect(barra).toHaveAttribute("aria-valuenow", "3");
    expect(barra).toHaveAttribute("aria-valuemax", "4");
    expect(barra).toHaveAccessibleName("3 de 4 vistas");
    expect(barra.firstElementChild).toHaveStyle({ width: "75%" });
  });

  it("fica em zero quando o total é zero", () => {
    render(<BarraProgresso progressoValorAtual={0} progressoValorTotal={0} />);

    expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({ width: "0%" });
  });
});

describe("GraficoDeFatias", () => {
  const fatia = (rotulo: string, valor: number, correta = false) => ({ rotulo, valor, correta, classe: `alt-${rotulo}` });

  it("sem respostas desenha só o círculo vazio", () => {
    const { container } = render(<GraficoDeFatias fatias={[fatia("a", 0), fatia("b", 0)]} />);

    expect(container.querySelectorAll("circle")).toHaveLength(1);
    expect(container.querySelectorAll("path")).toHaveLength(0);
  });

  it("com uma única alternativa escolhida desenha um círculo inteiro", () => {
    const { container } = render(<GraficoDeFatias fatias={[fatia("a", 0), fatia("b", 7, true)]} />);

    const circulo = container.querySelector("circle.fatia");
    expect(circulo).toHaveClass("alt-b");
    expect(circulo).toHaveAttribute("stroke", "#00783c");
  });

  it("com várias alternativas desenha uma fatia para cada uma e destaca a correta", () => {
    const { container } = render(<GraficoDeFatias fatias={[fatia("a", 1), fatia("b", 3, true), fatia("c", 0)]} />);

    const fatias = container.querySelectorAll("path");
    expect(fatias).toHaveLength(2);
    expect(fatias[0]).toHaveAttribute("stroke", "#ffffff");
    expect(fatias[1]).toHaveAttribute("stroke", "#00783c");
  });

  it("tem uma descrição para leitores de tela", () => {
    render(<GraficoDeFatias fatias={[fatia("a", 1)]} />);

    expect(screen.getByRole("img", { name: "Respostas da sala por alternativa" })).toBeInTheDocument();
  });
});

describe("Podio", () => {
  it("coloca o primeiro no centro, o segundo à esquerda e o terceiro à direita", () => {
    render(<Podio ranking={[linha(1, "Ana", 5), linha(2, "Bruno", 4), linha(3, "Clara", 3)]} />);

    const nomes = screen.getAllByRole("listitem").map((item) => item.querySelector(".podio-nome")?.textContent);
    expect(nomes).toEqual(["Bruno", "Ana", "Clara"]);
  });

  it("mostra a coroa só para o primeiro lugar", () => {
    render(<Podio ranking={[linha(1, "Ana", 5), linha(2, "Bruno", 4)]} />);

    expect(screen.getAllByAltText("Coroa do primeiro lugar")).toHaveLength(1);
  });

  it("descreve o desempenho com acertos, total e aproveitamento", () => {
    render(<Podio ranking={[linha(1, "Ana", 4, 5, 80)]} />);

    expect(screen.getByText("4 de 5 · 80%")).toBeInTheDocument();
  });

  it("mostra só os acertos quando ainda não houve pergunta exibida", () => {
    render(<Podio ranking={[linha(1, "Ana", 0, 0, null)]} />);

    expect(screen.getByText("0 acertos")).toBeInTheDocument();
  });

  it("mostra todos os empatados na mesma posição", () => {
    render(<Podio ranking={[linha(1, "Ana", 5), { ...linha(1, "Bia", 5), participanteId: 99 }, linha(3, "Caio", 2)]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByText("1º")).toHaveLength(2);
  });
});
