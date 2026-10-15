import { Router } from "express";
import { banco } from "../../banco/pool.ts";
import { exigirVisitante } from "../../middlewares/visitante.ts";

export const rotasProgresso = Router();

rotasProgresso.get("/", async (req, res) => {
  if (!req.visitanteId) {
    res.json([]);
    return;
  }
  const { rows } = await banco.query<{ pergunta_id: string }>(
    "SELECT pergunta_id FROM duvidas_vistas WHERE visitante_id = $1",
    [req.visitanteId],
  );
  res.json(rows.map((linha) => linha.pergunta_id));
});

rotasProgresso.post("/:perguntaId", exigirVisitante, async (req, res) => {
  const { rowCount } = await banco.query(
    `INSERT INTO duvidas_vistas (visitante_id, pergunta_id)
     SELECT $1, pergunta_id FROM perguntas WHERE pergunta_id = $2 AND pergunta_base_id IS NULL AND ativa
     ON CONFLICT DO NOTHING`,
    [req.visitanteId, String(req.params.perguntaId)],
  );
  res.status(rowCount ? 201 : 204).end();
});
