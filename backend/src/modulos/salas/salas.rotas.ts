import { Router } from "express";
import { DatabaseError } from "pg";
import { banco } from "../../banco/pool.ts";
import { exigirModerador, lerModeradorDoToken, nomeCookieModerador } from "../../middlewares/moderador.ts";
import { exigirVisitante } from "../../middlewares/visitante.ts";
import { gerarCodigoLivre, montarEstadoSala, montarRanking } from "./salas.service.ts";
import { sortearPerguntas, validarConfiguracaoQuiz } from "../quiz/quiz.service.ts";
import { canalModerador, io } from "../../tempoReal/io.ts";

export const rotasSalas = Router();

rotasSalas.post("/", exigirModerador, async (req, res) => {
  const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  if (nome.length < 1 || nome.length > 60) {
    res.status(400).json({ erro: "Dê um nome para a sala, de 1 a 60 caracteres." });
    return;
  }
  const configuracao = validarConfiguracaoQuiz(req.body);
  const segundos = req.body?.segundosPorPergunta ?? null;
  if (typeof configuracao === "string") {
    res.status(400).json({ erro: configuracao });
    return;
  }
  if (segundos !== null && (!Number.isInteger(segundos) || segundos < 10 || segundos > 60)) {
    res.status(400).json({ erro: "O cronômetro deve ter de 10 a 60 segundos." });
    return;
  }

  const cliente = await banco.connect();
  try {
    await cliente.query("BEGIN");
    const codigo = await gerarCodigoLivre(cliente);
    const { rows } = await cliente.query<{ sala_id: number }>(
      `INSERT INTO salas (codigo, nome, moderador_id, modo, quantidade_perguntas, usa_cronometro, segundos_por_pergunta)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING sala_id`,
      [codigo, nome, req.moderadorId, configuracao.modo, configuracao.quantidade, segundos !== null, segundos],
    );
    const salaId = rows[0].sala_id;
    for (const categoriaId of configuracao.categorias) {
      await cliente.query("INSERT INTO sala_categorias (sala_id, categoria_id) VALUES ($1, $2)", [salaId, categoriaId]);
    }
    for (const { pergunta_id, ordem } of await sortearPerguntas(cliente, configuracao)) {
      await cliente.query(
        "INSERT INTO sala_perguntas (sala_id, pergunta_id, ordem) VALUES ($1, $2, $3)",
        [salaId, pergunta_id, ordem],
      );
    }
    await cliente.query(
      `INSERT INTO sala_pergunta_alternativas (sala_pergunta_id, alternativa_id, posicao)
       SELECT sp.sala_pergunta_id, a.alternativa_id, row_number() OVER (PARTITION BY sp.sala_pergunta_id ORDER BY random())
       FROM sala_perguntas sp
       JOIN alternativas a ON a.pergunta_id = sp.pergunta_id
       WHERE sp.sala_id = $1`,
      [salaId],
    );
    await cliente.query("COMMIT");
    res.status(201).json({ codigo });
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
});

rotasSalas.get("/minhas", exigirModerador, async (req, res) => {
  const texto = typeof req.query.busca === "string" ? req.query.busca.trim().replace(/[\\%_]/g, "\\$&") : "";
  const dataValida = (valor: unknown) => (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor : null);
  const { rows } = await banco.query(
    `SELECT s.codigo, s.nome, s.status, s.modo, s.quantidade_perguntas AS quantidade, s.data_criacao AS "criadaEm",
            (SELECT count(*) FROM participantes p WHERE p.sala_id = s.sala_id)::int AS participantes
     FROM salas s
     WHERE s.moderador_id = $1
       AND ($2 = '' OR s.nome ILIKE '%' || $2 || '%' OR s.codigo ILIKE $2 || '%')
       AND ($3::date IS NULL OR s.data_criacao >= $3::date)
       AND ($4::date IS NULL OR s.data_criacao < $4::date + 1)
     ORDER BY s.data_criacao DESC`,
    [req.moderadorId, texto, dataValida(req.query.de), dataValida(req.query.ate)],
  );
  res.json(rows);
});

rotasSalas.get("/:codigo/ranking", exigirModerador, async (req, res) => {
  const moderadorId = req.moderadorId;
  const { rows } = await banco.query<{ sala_id: number }>(
    "SELECT sala_id FROM salas WHERE codigo = $1 AND moderador_id = $2",
    [String(req.params.codigo).toUpperCase(), moderadorId],
  );
  if (!rows[0]) {
    res.status(403).json({ erro: "Só o moderador dono da sala vê o ranking geral." });
    return;
  }
  res.json(await montarRanking(rows[0].sala_id));
});

rotasSalas.post("/:codigo/participantes", exigirVisitante, async (req, res) => {
  const codigo = String(req.params.codigo).toUpperCase();
  const apelido = typeof req.body?.apelido === "string" ? req.body.apelido.trim() : "";

  const cliente = await banco.connect();
  try {
    await cliente.query("BEGIN");
    const { rows: salas } = await cliente.query<{ sala_id: number; status: string }>(
      "SELECT sala_id, status FROM salas WHERE codigo = $1",
      [codigo],
    );
    const sala = salas[0];
    if (!sala) {
      await cliente.query("ROLLBACK");
      res.status(404).json({ erro: "Código de sala não encontrado." });
      return;
    }

    const { rows: existentes } = await cliente.query<{ id: number; apelido: string }>(
      "UPDATE participantes SET data_ultimo_acesso = now() WHERE sala_id = $1 AND visitante_id = $2 RETURNING participante_id AS id, apelido",
      [sala.sala_id, req.visitanteId],
    );
    if (existentes[0]) {
      await cliente.query("COMMIT");
      res.json({ participante: existentes[0], reconectado: true });
      return;
    }

    if (sala.status === "ranking" || sala.status === "encerrada") {
      await cliente.query("ROLLBACK");
      res.status(409).json({ erro: "Esta sala já terminou e não aceita novas entradas." });
      return;
    }
    if (apelido.length < 1 || apelido.length > 30) {
      await cliente.query("ROLLBACK");
      res.status(400).json({ erro: "Escolha um apelido de 1 a 30 caracteres.", precisaApelido: true });
      return;
    }

    const { rows: novos } = await cliente.query<{ id: number; apelido: string }>(
      "INSERT INTO participantes (sala_id, visitante_id, apelido) VALUES ($1, $2, $3) RETURNING participante_id AS id, apelido",
      [sala.sala_id, req.visitanteId, apelido],
    );
    const { rows: contagem } = await cliente.query<{ total: number }>(
      "SELECT count(*)::int AS total FROM participantes WHERE sala_id = $1",
      [sala.sala_id],
    );
    await cliente.query("COMMIT");
    io.to(canalModerador(codigo)).emit("participantes-atualizados", { total: contagem[0].total });
    res.status(201).json({ participante: novos[0], reconectado: false });
  } catch (erro) {
    await cliente.query("ROLLBACK");
    if (erro instanceof DatabaseError && erro.constraint === "uq_participantes_apelido") {
      res.status(409).json({ erro: "Esse apelido já está em uso nesta sala.", precisaApelido: true });
      return;
    }
    throw erro;
  } finally {
    cliente.release();
  }
});

rotasSalas.get("/:codigo/estado", async (req, res) => {
  const estado = await montarEstadoSala(String(req.params.codigo).toUpperCase(), {
    moderadorId: lerModeradorDoToken(req.cookies[nomeCookieModerador]),
    visitanteId: req.visitanteId ?? null,
  });
  if (!estado) {
    res.status(404).json({ erro: "Código de sala não encontrado." });
    return;
  }
  if ("semAcesso" in estado) {
    res.status(403).json({ erro: "Entre na sala pelo código primeiro." });
    return;
  }
  res.json(estado);
});
