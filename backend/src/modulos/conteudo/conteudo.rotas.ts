import { Router } from "express";
import { banco } from "../../banco/pool.ts";

export const rotasConteudo = Router();

rotasConteudo.get("/categorias", async (_req, res) => {
  const { rows } = await banco.query(`
    SELECT c.categoria_id AS "categoriaId",
           c.nome AS "categoriaNome",
           c.descricao AS "categoriaDescricao",
           c.icone AS "categoriaIcone",
           coalesce(
             json_agg(
               json_build_object('duvidaId', p.pergunta_id, 'duvidaPergunta', p.enunciado, 'duvidaResposta', p.resposta)
               ORDER BY p.ordem
             ) FILTER (WHERE p.pergunta_id IS NOT NULL),
             '[]'
           ) AS "categoriaDuvidas"
    FROM categorias c
    LEFT JOIN perguntas p ON p.categoria_id = c.categoria_id AND p.pergunta_base_id IS NULL AND p.ativa
    GROUP BY c.categoria_id
    ORDER BY c.ordem`);
  res.json(rows);
});
