import { Router } from "express";
import { banco } from "../../banco/pool.ts";
import { exigirVisitante } from "../../middlewares/visitante.ts";
import { sortearPerguntas, validarConfiguracaoQuiz } from "./quiz.service.ts";

export const rotasQuizIndividual = Router();

rotasQuizIndividual.post("/partidas", exigirVisitante, async (req, res) => {
  const repetirPartidaId = req.body?.repetirPartidaId;
  const configuracao = repetirPartidaId ? null : validarConfiguracaoQuiz(req.body);
  if (typeof configuracao === "string") {
    res.status(400).json({ erro: configuracao });
    return;
  }

  const cliente = await banco.connect();
  try {
    await cliente.query("BEGIN");
    let partidaId: number;

    if (configuracao) {
      const { rows } = await cliente.query<{ partida_individual_id: number }>(
        "INSERT INTO partidas_individuais (visitante_id, modo) VALUES ($1, $2) RETURNING partida_individual_id",
        [req.visitanteId, configuracao.modo],
      );
      partidaId = rows[0].partida_individual_id;
      const sorteadas = await sortearPerguntas(cliente, configuracao);
      for (const { pergunta_id, ordem } of sorteadas) {
        await cliente.query(
          "INSERT INTO partida_perguntas (partida_individual_id, pergunta_id, ordem) VALUES ($1, $2, $3)",
          [partidaId, pergunta_id, ordem],
        );
      }
    } else {
      const { rows } = await cliente.query<{ partida_individual_id: number }>(
        `INSERT INTO partidas_individuais (visitante_id, modo)
         SELECT visitante_id, modo FROM partidas_individuais WHERE partida_individual_id = $1 AND visitante_id = $2
         RETURNING partida_individual_id`,
        [repetirPartidaId, req.visitanteId],
      );
      if (!rows[0]) {
        await cliente.query("ROLLBACK");
        res.status(404).json({ erro: "Partida não encontrada." });
        return;
      }
      partidaId = rows[0].partida_individual_id;
      await cliente.query(
        `INSERT INTO partida_perguntas (partida_individual_id, pergunta_id, ordem)
         SELECT $1, pergunta_id, ordem FROM partida_perguntas WHERE partida_individual_id = $2`,
        [partidaId, repetirPartidaId],
      );
    }

    const { rows: perguntas } = await cliente.query(
      `SELECT p.pergunta_id AS "duvidaId",
              p.enunciado AS "duvidaPergunta",
              c.nome AS "categoriaNome",
              json_agg(json_build_object('alternativaId', a.alternativa_id, 'texto', a.texto) ORDER BY random()) AS "opcoesResposta"
       FROM partida_perguntas pp
       JOIN perguntas p ON p.pergunta_id = pp.pergunta_id
       JOIN categorias c ON c.categoria_id = p.categoria_id
       JOIN alternativas a ON a.pergunta_id = p.pergunta_id
       WHERE pp.partida_individual_id = $1
       GROUP BY pp.ordem, p.pergunta_id, c.nome
       ORDER BY pp.ordem`,
      [partidaId],
    );
    await cliente.query("COMMIT");
    res.status(201).json({ partidaId, perguntas });
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
});

rotasQuizIndividual.post("/partidas/:partidaId/respostas", exigirVisitante, async (req, res) => {
  const partidaId = Number(req.params.partidaId);
  const perguntaId = String(req.body?.perguntaId ?? "");
  const alternativaId = Number(req.body?.alternativaId);
  if (!Number.isInteger(partidaId) || !Number.isInteger(alternativaId)) {
    res.status(400).json({ erro: "Dados inválidos." });
    return;
  }

  const { rows } = await banco.query<{ correta: boolean }>(
    `INSERT INTO respostas_individuais (partida_individual_id, pergunta_id, alternativa_id, correta)
     SELECT pp.partida_individual_id, pp.pergunta_id, a.alternativa_id, a.correta
     FROM partida_perguntas pp
     JOIN partidas_individuais pi ON pi.partida_individual_id = pp.partida_individual_id
     JOIN alternativas a ON a.pergunta_id = pp.pergunta_id AND a.alternativa_id = $4
     WHERE pp.partida_individual_id = $1 AND pp.pergunta_id = $2 AND pi.visitante_id = $3 AND pi.data_fim IS NULL
     ON CONFLICT (partida_individual_id, pergunta_id) DO NOTHING
     RETURNING correta`,
    [partidaId, perguntaId, req.visitanteId, alternativaId],
  );
  if (!rows[0]) {
    res.status(409).json({ erro: "Resposta não aceita." });
    return;
  }

  const { rows: corretas } = await banco.query<{ alternativa_id: number }>(
    "SELECT alternativa_id FROM alternativas WHERE pergunta_id = $1 AND correta",
    [perguntaId],
  );
  await banco.query(
    `UPDATE partidas_individuais SET data_fim = now()
     WHERE partida_individual_id = $1 AND data_fim IS NULL
       AND (SELECT count(*) FROM respostas_individuais WHERE partida_individual_id = $1)
         = (SELECT count(*) FROM partida_perguntas WHERE partida_individual_id = $1)`,
    [partidaId],
  );
  res.json({ correta: rows[0].correta, alternativaCorretaId: corretas[0].alternativa_id });
});
