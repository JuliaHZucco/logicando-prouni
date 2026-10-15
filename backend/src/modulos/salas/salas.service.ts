import { randomInt } from "node:crypto";
import type pg from "pg";
import { banco } from "../../banco/pool.ts";
import { canalModerador, canalSala, io } from "../../tempoReal/io.ts";

const caracteresCodigo = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const posicoesDoPodio = 3;
const cronometros = new Map<number, NodeJS.Timeout>();

export async function gerarCodigoLivre(cliente: pg.PoolClient): Promise<string> {
  for (;;) {
    const codigo = Array.from({ length: 6 }, () => caracteresCodigo[randomInt(caracteresCodigo.length)]).join("");
    const { rowCount } = await cliente.query("SELECT 1 FROM salas WHERE codigo = $1", [codigo]);
    if (!rowCount) return codigo;
  }
}

export async function contarParticipantes(salaId: number): Promise<number> {
  const { rows } = await banco.query<{ total: number }>(
    "SELECT count(*)::int AS total FROM participantes WHERE sala_id = $1",
    [salaId],
  );
  return rows[0].total;
}

async function buscarPerguntaAtual(salaId: number) {
  const { rows } = await banco.query<{
    sala_pergunta_id: number;
    rodada: number;
    ordem: number;
    enunciado: string;
    segundos_restantes: number | null;
    alternativas: { alternativaId: number; texto: string; posicao: number }[];
  }>(
    `SELECT sp.sala_pergunta_id,
            sp.ordem,
            p.enunciado,
            s.rodada_atual AS rodada,
            CASE WHEN s.segundos_por_pergunta IS NULL OR s.status <> 'pergunta_aberta' THEN NULL
                 ELSE greatest(0, ceil(extract(epoch FROM e.data_abertura + make_interval(secs => s.segundos_por_pergunta) - now())))::int
            END AS segundos_restantes,
            (SELECT json_agg(json_build_object('alternativaId', a.alternativa_id, 'texto', a.texto, 'posicao', spa.posicao) ORDER BY spa.posicao)
             FROM sala_pergunta_alternativas spa JOIN alternativas a ON a.alternativa_id = spa.alternativa_id
             WHERE spa.sala_pergunta_id = sp.sala_pergunta_id) AS alternativas
     FROM salas s
     JOIN sala_perguntas sp ON sp.sala_id = s.sala_id AND sp.ordem = s.pergunta_atual
     JOIN exibicoes e ON e.sala_pergunta_id = sp.sala_pergunta_id AND e.rodada = s.rodada_atual
     JOIN perguntas p ON p.pergunta_id = sp.pergunta_id
     WHERE s.sala_id = $1`,
    [salaId],
  );
  return rows[0];
}

async function contarRespostas(salaPerguntaId: number, rodada: number): Promise<number> {
  const { rows } = await banco.query<{ total: number }>(
    "SELECT count(*)::int AS total FROM respostas WHERE sala_pergunta_id = $1 AND rodada = $2",
    [salaPerguntaId, rodada],
  );
  return rows[0].total;
}

async function montarResultado(salaPerguntaId: number, rodada: number) {
  const { rows } = await banco.query<{ alternativaId: number; posicao: number; texto: string; correta: boolean; respostas: number }>(
    `SELECT a.alternativa_id AS "alternativaId", spa.posicao, a.texto, a.correta, count(r.resposta_id)::int AS respostas
     FROM sala_pergunta_alternativas spa
     JOIN alternativas a ON a.alternativa_id = spa.alternativa_id
     LEFT JOIN respostas r
       ON r.sala_pergunta_id = spa.sala_pergunta_id AND r.alternativa_id = spa.alternativa_id AND r.rodada = $2
     WHERE spa.sala_pergunta_id = $1
     GROUP BY spa.posicao, a.alternativa_id
     ORDER BY spa.posicao`,
    [salaPerguntaId, rodada],
  );
  const totalRespostas = rows.reduce((soma, linha) => soma + linha.respostas, 0);
  return {
    totalRespostas,
    alternativaCorretaId: rows.find((linha) => linha.correta)!.alternativaId,
    grafico: rows.map(({ alternativaId, posicao, texto, respostas }) => ({
      alternativaId,
      posicao,
      texto,
      respostas,
      percentual: totalRespostas ? Math.round((1000 * respostas) / totalRespostas) / 10 : 0,
    })),
  };
}

export async function montarRanking(salaId: number) {
  const { rows } = await banco.query<{ participanteId: number; apelido: string; acertos: number; posicao: number; perguntasExibidas: number }>(
    `SELECT pa.participante_id AS "participanteId",
            pa.apelido,
            (count(r.resposta_id) FILTER (WHERE r.correta))::int AS acertos,
            rank() OVER (ORDER BY count(r.resposta_id) FILTER (WHERE r.correta) DESC)::int AS posicao,
            (SELECT count(*)
             FROM sala_perguntas sp
             JOIN exibicoes e ON e.sala_pergunta_id = sp.sala_pergunta_id AND e.rodada = s.rodada_atual
             WHERE sp.sala_id = s.sala_id AND e.data_encerramento > pa.data_entrada)::int AS "perguntasExibidas"
     FROM participantes pa
     JOIN salas s ON s.sala_id = pa.sala_id
     LEFT JOIN respostas r ON r.participante_id = pa.participante_id AND r.rodada = s.rodada_atual
     WHERE pa.sala_id = $1
     GROUP BY pa.participante_id, s.sala_id
     ORDER BY posicao, lower(pa.apelido)`,
    [salaId],
  );
  return rows.map((linha) => ({
    ...linha,
    aproveitamento: linha.perguntasExibidas ? Math.round((100 * linha.acertos) / linha.perguntasExibidas) : null,
  }));
}

export function montarPodio<T extends { posicao: number }>(ranking: T[]) {
  return ranking.filter((linha) => linha.posicao <= posicoesDoPodio);
}

export async function montarEstadoSala(codigo: string, acesso: { moderadorId: number | null; visitanteId: number | null }) {
  const { rows } = await banco.query<{ sala_id: number; moderador_id: number; status: string; quantidade_perguntas: number; pergunta_atual: number | null; rodada_atual: number }>(
    "SELECT sala_id, moderador_id, status, quantidade_perguntas, pergunta_atual, rodada_atual FROM salas WHERE codigo = $1",
    [codigo],
  );
  const sala = rows[0];
  if (!sala) return null;

  const souModerador = sala.moderador_id === acesso.moderadorId;
  const { rows: participantes } = acesso.visitanteId
    ? await banco.query<{ id: number; apelido: string }>(
        "SELECT participante_id AS id, apelido FROM participantes WHERE sala_id = $1 AND visitante_id = $2",
        [sala.sala_id, acesso.visitanteId],
      )
    : { rows: [] };
  const participante = participantes[0] ?? null;
  if (!souModerador && !participante) return { semAcesso: true as const };

  const estado: Record<string, unknown> = {
    codigo,
    status: sala.status,
    quantidadePerguntas: sala.quantidade_perguntas,
    perguntaAtual: sala.pergunta_atual,
    rodada: sala.rodada_atual,
    totalParticipantes: await contarParticipantes(sala.sala_id),
    souModerador,
    participante,
  };

  if (sala.status === "pergunta_aberta" || sala.status === "resultado_pergunta") {
    const pergunta = await buscarPerguntaAtual(sala.sala_id);
    estado.pergunta = {
      ordem: pergunta.ordem,
      enunciado: pergunta.enunciado,
      alternativas: pergunta.alternativas,
      segundosRestantes: pergunta.segundos_restantes,
      respondidas: await contarRespostas(pergunta.sala_pergunta_id, pergunta.rodada),
    };
    if (participante) {
      const { rows: minhas } = await banco.query<{ alternativa_id: number }>(
        "SELECT alternativa_id FROM respostas WHERE sala_pergunta_id = $1 AND rodada = $2 AND participante_id = $3",
        [pergunta.sala_pergunta_id, pergunta.rodada, participante.id],
      );
      estado.minhaAlternativaId = minhas[0]?.alternativa_id ?? null;
    }
    if (sala.status === "resultado_pergunta") {
      estado.resultado = await montarResultado(pergunta.sala_pergunta_id, pergunta.rodada);
    }
  }

  if (sala.status === "ranking" || sala.status === "encerrada") {
    const geral = await montarRanking(sala.sala_id);
    estado.ranking = montarPodio(geral);
    estado.minhaPosicao = participante ? (geral.find((linha) => linha.participanteId === participante.id) ?? null) : null;
  }
  return estado;
}

function agendarEncerramento(salaId: number, segundos: number) {
  clearTimeout(cronometros.get(salaId));
  cronometros.set(salaId, setTimeout(() => void encerrarPergunta(salaId, null), segundos * 1000));
}

export async function avancar(codigo: string, moderadorId: number) {
  const { rows } = await banco.query<{ sala_id: number; status: string; pergunta_atual: number; segundos_por_pergunta: number | null }>(
    `WITH sala AS (
       UPDATE salas
       SET status = CASE WHEN coalesce(pergunta_atual, 0) < quantidade_perguntas THEN 'pergunta_aberta' ELSE 'ranking' END,
           pergunta_atual = CASE WHEN coalesce(pergunta_atual, 0) < quantidade_perguntas THEN coalesce(pergunta_atual, 0) + 1 ELSE pergunta_atual END
       WHERE codigo = $1 AND moderador_id = $2 AND status IN ('aguardando', 'resultado_pergunta')
       RETURNING sala_id, status, pergunta_atual, segundos_por_pergunta, rodada_atual
     ),
     abertura AS (
       INSERT INTO exibicoes (sala_pergunta_id, rodada)
       SELECT sp.sala_pergunta_id, sala.rodada_atual
       FROM sala
       JOIN sala_perguntas sp ON sp.sala_id = sala.sala_id AND sp.ordem = sala.pergunta_atual
       WHERE sala.status = 'pergunta_aberta'
     )
     SELECT * FROM sala`,
    [codigo, moderadorId],
  );
  const sala = rows[0];
  if (!sala) return false;

  if (sala.status === "ranking") {
    io.to(canalSala(codigo)).emit("ranking-disponivel", { ranking: montarPodio(await montarRanking(sala.sala_id)) });
    return true;
  }

  if (sala.segundos_por_pergunta) agendarEncerramento(sala.sala_id, sala.segundos_por_pergunta);
  const pergunta = await buscarPerguntaAtual(sala.sala_id);
  io.to(canalSala(codigo)).emit("pergunta-iniciada", {
    ordem: pergunta.ordem,
    enunciado: pergunta.enunciado,
    alternativas: pergunta.alternativas,
    segundosRestantes: pergunta.segundos_restantes,
  });
  return true;
}

export async function encerrarPergunta(salaId: number, moderadorId: number | null) {
  const cliente = await banco.connect();
  let sala: { codigo: string; pergunta_atual: number; rodada_atual: number } | undefined;
  try {
    await cliente.query("BEGIN");
    const { rows } = await cliente.query<{ codigo: string; pergunta_atual: number; rodada_atual: number }>(
      `UPDATE salas SET status = 'resultado_pergunta'
       WHERE sala_id = $1 AND status = 'pergunta_aberta' AND ($2::int IS NULL OR moderador_id = $2)
       RETURNING codigo, pergunta_atual, rodada_atual`,
      [salaId, moderadorId],
    );
    sala = rows[0];
    if (sala) {
      await cliente.query(
        `UPDATE exibicoes e SET data_encerramento = now()
         FROM sala_perguntas sp
         WHERE sp.sala_pergunta_id = e.sala_pergunta_id AND sp.sala_id = $1 AND sp.ordem = $2 AND e.rodada = $3`,
        [salaId, sala.pergunta_atual, sala.rodada_atual],
      );
    }
    await cliente.query("COMMIT");
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
  if (!sala) return false;

  clearTimeout(cronometros.get(salaId));
  cronometros.delete(salaId);
  const pergunta = await buscarPerguntaAtual(salaId);
  io.to(canalSala(sala.codigo)).emit("pergunta-encerrada", await montarResultado(pergunta.sala_pergunta_id, pergunta.rodada));
  return true;
}

export async function encerrarSala(codigo: string, moderadorId: number) {
  const cliente = await banco.connect();
  let salaId: number | undefined;
  try {
    await cliente.query("BEGIN");
    const { rows } = await cliente.query<{ sala_id: number }>(
      `UPDATE salas SET status = 'encerrada', data_encerramento = now()
       WHERE codigo = $1 AND moderador_id = $2 AND status <> 'encerrada'
       RETURNING sala_id`,
      [codigo, moderadorId],
    );
    salaId = rows[0]?.sala_id;
    if (salaId) {
      await cliente.query(
        `UPDATE exibicoes e SET data_encerramento = now()
         FROM sala_perguntas sp
         WHERE sp.sala_pergunta_id = e.sala_pergunta_id AND sp.sala_id = $1 AND e.data_encerramento IS NULL`,
        [salaId],
      );
    }
    await cliente.query("COMMIT");
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
  if (!salaId) return false;

  clearTimeout(cronometros.get(salaId));
  cronometros.delete(salaId);
  io.to(canalSala(codigo)).emit("sala-encerrada", { ranking: montarPodio(await montarRanking(salaId)) });
  return true;
}

export async function jogarNovamente(codigo: string, moderadorId: number) {
  const { rows } = await banco.query<{ rodada_atual: number }>(
    `UPDATE salas SET status = 'aguardando', pergunta_atual = NULL, rodada_atual = rodada_atual + 1
     WHERE codigo = $1 AND moderador_id = $2 AND status = 'ranking'
     RETURNING rodada_atual`,
    [codigo, moderadorId],
  );
  if (!rows[0]) return false;
  io.to(canalSala(codigo)).emit("nova-rodada", { rodada: rows[0].rodada_atual });
  return true;
}

export async function responder(codigo: string, visitanteId: number, alternativaId: number) {
  const { rows } = await banco.query<{ sala_pergunta_id: number; rodada: number }>(
    `INSERT INTO respostas (sala_pergunta_id, rodada, participante_id, alternativa_id, correta)
     SELECT sp.sala_pergunta_id, e.rodada, pa.participante_id, a.alternativa_id, a.correta
     FROM salas s
     JOIN sala_perguntas sp ON sp.sala_id = s.sala_id AND sp.ordem = s.pergunta_atual
     JOIN exibicoes e ON e.sala_pergunta_id = sp.sala_pergunta_id AND e.rodada = s.rodada_atual
     JOIN participantes pa ON pa.sala_id = s.sala_id AND pa.visitante_id = $2
     JOIN sala_pergunta_alternativas spa ON spa.sala_pergunta_id = sp.sala_pergunta_id AND spa.alternativa_id = $3
     JOIN alternativas a ON a.alternativa_id = spa.alternativa_id
     WHERE s.codigo = $1
       AND s.status = 'pergunta_aberta'
       AND e.data_encerramento IS NULL
       AND (s.segundos_por_pergunta IS NULL OR now() <= e.data_abertura + make_interval(secs => s.segundos_por_pergunta + 1))
     FOR SHARE OF s
     ON CONFLICT (sala_pergunta_id, rodada, participante_id) DO NOTHING
     RETURNING sala_pergunta_id, rodada`,
    [codigo, visitanteId, alternativaId],
  );
  if (!rows[0]) return false;
  io.to(canalModerador(codigo)).emit("resposta-registrada", {
    respondidas: await contarRespostas(rows[0].sala_pergunta_id, rows[0].rodada),
  });
  return true;
}

export async function retomarCronometros() {
  const { rows } = await banco.query<{ sala_id: number; restante: number }>(
    `SELECT s.sala_id, extract(epoch FROM e.data_abertura + make_interval(secs => s.segundos_por_pergunta) - now())::float AS restante
     FROM salas s
     JOIN sala_perguntas sp ON sp.sala_id = s.sala_id AND sp.ordem = s.pergunta_atual
     JOIN exibicoes e ON e.sala_pergunta_id = sp.sala_pergunta_id AND e.rodada = s.rodada_atual
     WHERE s.status = 'pergunta_aberta' AND s.segundos_por_pergunta IS NOT NULL`,
  );
  for (const { sala_id, restante } of rows) {
    if (restante <= 0) await encerrarPergunta(sala_id, null);
    else agendarEncerramento(sala_id, restante);
  }
}
