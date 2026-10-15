import type pg from "pg";

export type ModoQuiz = "aleatorio" | "categoria" | "misto";

export interface ConfiguracaoQuiz {
  modo: ModoQuiz;
  categorias: string[];
  quantidade: number;
}

export function validarConfiguracaoQuiz(corpo: unknown): ConfiguracaoQuiz | string {
  const { modo, categorias, quantidade } = (corpo ?? {}) as Record<string, unknown>;
  if (modo !== "aleatorio" && modo !== "categoria" && modo !== "misto") return "Modo inválido.";
  if (!Number.isInteger(quantidade) || (quantidade as number) < 1 || (quantidade as number) > 10) {
    return "A quantidade deve ser de 1 a 10 perguntas.";
  }
  const listaCategorias = Array.isArray(categorias) ? [...new Set(categorias.map(String))] : [];
  if (modo === "aleatorio" && listaCategorias.length > 0) return "O modo aleatório não usa categorias.";
  if (modo === "categoria" && listaCategorias.length !== 1) return "Escolha exatamente uma categoria.";
  if (modo === "misto" && listaCategorias.length < 1) return "Escolha pelo menos uma categoria.";
  if (modo === "misto" && (quantidade as number) < listaCategorias.length) {
    return "No modo misto, a quantidade mínima é o número de categorias escolhidas.";
  }
  return { modo, categorias: listaCategorias, quantidade: quantidade as number };
}

export async function sortearPerguntas(cliente: pg.PoolClient, configuracao: ConfiguracaoQuiz) {
  const { rows } = await cliente.query<{ pergunta_id: string; ordem: number }>(
    `WITH candidatas AS (
       SELECT p.pergunta_id, p.categoria_id, random() AS sorteio
       FROM perguntas p
       WHERE p.ativa
         AND EXISTS (SELECT 1 FROM alternativas a WHERE a.pergunta_id = p.pergunta_id)
         AND ($1 = 'aleatorio' OR p.categoria_id = ANY ($2::text[]))
     ),
     numeradas AS (
       SELECT pergunta_id, sorteio, row_number() OVER (PARTITION BY categoria_id ORDER BY sorteio) AS posicao_na_categoria
       FROM candidatas
     ),
     escolhidas AS (
       SELECT pergunta_id FROM numeradas
       ORDER BY CASE WHEN $1 = 'misto' AND posicao_na_categoria = 1 THEN 0 ELSE 1 END, sorteio
       LIMIT $3
     )
     SELECT pergunta_id, row_number() OVER (ORDER BY random())::int AS ordem
     FROM escolhidas`,
    [configuracao.modo, configuracao.categorias, configuracao.quantidade],
  );
  if (rows.length < configuracao.quantidade) {
    throw new Error("Não há perguntas suficientes para essa configuração.");
  }
  return rows;
}
