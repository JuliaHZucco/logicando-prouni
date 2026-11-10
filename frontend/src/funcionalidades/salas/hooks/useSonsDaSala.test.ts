import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { criarEstado, criarPergunta, criarResultado } from "../../../testes/fabricas";
import { tocarSomFinalizacao, tocarSomResposta } from "../../../utilitarios/sons";
import type { EstadoSala, LinhaRanking } from "../tipos";
import { useSonsDaSala } from "./useSonsDaSala";

vi.mock("../../../utilitarios/sons", () => ({ tocarSomResposta: vi.fn(), tocarSomFinalizacao: vi.fn() }));

function iniciar(estadoInicial: EstadoSala | null) {
  return renderHook(({ estado }) => useSonsDaSala(estado), { initialProps: { estado: estadoInicial } });
}

const aberta = () => criarEstado({ status: "pergunta_aberta", pergunta: criarPergunta() });
const comAproveitamento = (aproveitamento: number | null): LinhaRanking => ({
  participanteId: 1,
  apelido: "Ana",
  acertos: 2,
  posicao: 1,
  perguntasExibidas: 3,
  aproveitamento,
});

describe("useSonsDaSala", () => {
  it("não toca nada ao abrir a tela", () => {
    iniciar(aberta());

    expect(tocarSomResposta).not.toHaveBeenCalled();
    expect(tocarSomFinalizacao).not.toHaveBeenCalled();
  });

  it("não toca nada enquanto o estado ainda não chegou", () => {
    const { rerender } = iniciar(null);

    rerender({ estado: null });

    expect(tocarSomResposta).not.toHaveBeenCalled();
  });

  it("toca o som de acerto quando o resultado mostra que a pessoa acertou", () => {
    const { rerender } = iniciar(aberta());

    rerender({ estado: criarEstado({ status: "resultado_pergunta", minhaAlternativaId: 12, resultado: criarResultado() }) });

    expect(tocarSomResposta).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("toca o som de erro quando a pessoa errou", () => {
    const { rerender } = iniciar(aberta());

    rerender({ estado: criarEstado({ status: "resultado_pergunta", minhaAlternativaId: 11, resultado: criarResultado() }) });

    expect(tocarSomResposta).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("toca o som de erro quando a pessoa não respondeu", () => {
    const { rerender } = iniciar(aberta());

    rerender({ estado: criarEstado({ status: "resultado_pergunta", minhaAlternativaId: null, resultado: criarResultado() }) });

    expect(tocarSomResposta).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("no fim do quiz toca o som alto quando o aproveitamento passa de 50%", () => {
    const { rerender } = iniciar(aberta());

    rerender({ estado: criarEstado({ status: "ranking", minhaPosicao: comAproveitamento(80) }) });

    expect(tocarSomFinalizacao).toHaveBeenCalledExactlyOnceWith(true);
  });

  it.each([50, 20, null])("no fim do quiz toca o som baixo com aproveitamento %s", (aproveitamento) => {
    const { rerender } = iniciar(aberta());

    rerender({ estado: criarEstado({ status: "ranking", minhaPosicao: comAproveitamento(aproveitamento) }) });

    expect(tocarSomFinalizacao).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("não toca de novo quando a sala passa do ranking para encerrada", () => {
    const { rerender } = iniciar(aberta());
    rerender({ estado: criarEstado({ status: "ranking", minhaPosicao: comAproveitamento(80) }) });

    rerender({ estado: criarEstado({ status: "encerrada", minhaPosicao: comAproveitamento(80) }) });

    expect(tocarSomFinalizacao).toHaveBeenCalledOnce();
  });

  it("não toca quando o estado muda sem mudar de etapa", () => {
    const { rerender } = iniciar(aberta());

    rerender({ estado: { ...aberta(), totalParticipantes: 9 } });

    expect(tocarSomResposta).not.toHaveBeenCalled();
    expect(tocarSomFinalizacao).not.toHaveBeenCalled();
  });

  it("não toca para quem não é participante (o moderador)", () => {
    const { rerender } = iniciar(criarEstado({ status: "pergunta_aberta", participante: null }));

    rerender({ estado: criarEstado({ status: "resultado_pergunta", participante: null, resultado: criarResultado() }) });

    expect(tocarSomResposta).not.toHaveBeenCalled();
  });
});
