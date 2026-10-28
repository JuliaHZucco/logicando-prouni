import { buscarJson, enviarJson, tratarErro } from "../../../utilitarios/api";
import type { ConfiguracaoQuiz, PartidaQuiz, ResultadoPartida, ResultadoResposta } from "../tipos";

export async function iniciarPartida(configuracao: ConfiguracaoQuiz): Promise<PartidaQuiz> {
  return tratarErro(await enviarJson<PartidaQuiz>("/api/quiz/partidas", configuracao));
}

export async function repetirPartida(partidaId: number): Promise<PartidaQuiz> {
  return tratarErro(await enviarJson<PartidaQuiz>("/api/quiz/partidas", { repetirPartidaId: partidaId }));
}

export async function responderPergunta(
  partidaId: number,
  perguntaId: string,
  alternativaId: number,
): Promise<ResultadoResposta> {
  return tratarErro(
    await enviarJson<ResultadoResposta>(`/api/quiz/partidas/${partidaId}/respostas`, {
      perguntaId,
      alternativaId,
    }),
  );
}

export async function buscarResultadoDaPartida(partidaId: number): Promise<ResultadoPartida> {
  return tratarErro(await buscarJson<ResultadoPartida>(`/api/quiz/partidas/${partidaId}/resultado`));
}
