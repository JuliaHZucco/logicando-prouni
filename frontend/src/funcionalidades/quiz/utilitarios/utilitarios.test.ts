import { describe, expect, it } from "vitest";
import { classeDaAlternativa } from "./alternativas";
import { ajustarQuantidade, quantidadeMaximaDePerguntas } from "./quantidade";

describe("classeDaAlternativa", () => {
  it("devolve uma classe por posição, de A a D", () => {
    expect([0, 1, 2, 3].map(classeDaAlternativa)).toEqual(["alt-a", "alt-b", "alt-c", "alt-d"]);
  });

  it("volta ao início depois da quarta alternativa", () => {
    expect(classeDaAlternativa(4)).toBe("alt-a");
    expect(classeDaAlternativa(7)).toBe("alt-d");
  });
});

describe("ajustarQuantidade", () => {
  it("mantém valores dentro do intervalo", () => {
    expect(ajustarQuantidade(5, 1)).toBe(5);
  });

  it("não deixa passar do máximo de 10 perguntas", () => {
    expect(quantidadeMaximaDePerguntas).toBe(10);
    expect(ajustarQuantidade(25, 1)).toBe(10);
  });

  it("respeita o mínimo informado (por exemplo, uma pergunta por categoria)", () => {
    expect(ajustarQuantidade(1, 3)).toBe(3);
  });

  it("o máximo vale mesmo quando o mínimo é maior", () => {
    expect(ajustarQuantidade(2, 12)).toBe(10);
  });
});
