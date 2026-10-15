import "dotenv/config";
import pg from "pg";
import { categorias } from "./dados/conteudo.ts";
import { alternativasQuiz } from "./dados/alternativasQuiz.ts";
import { perguntasQuizDerivadas } from "./dados/perguntasQuizDerivadas.ts";
import type { OpcaoQuiz } from "./tipos.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function validarOpcoes(perguntaId: string, opcoes: OpcaoQuiz[] | undefined): OpcaoQuiz[] {
  if (!opcoes || opcoes.length !== 4 || opcoes.filter((opcao) => opcao.correta).length !== 1) {
    throw new Error(`Pergunta ${perguntaId} precisa de 4 alternativas e exatamente 1 correta.`);
  }
  return opcoes;
}

async function inserirAlternativas(cliente: pg.PoolClient, perguntaId: string, opcoes: OpcaoQuiz[]) {
  for (const opcao of opcoes) {
    await cliente.query(
      "INSERT INTO alternativas (pergunta_id, letra, texto, correta) VALUES ($1, $2, $3, $4)",
      [perguntaId, opcao.opcaoId, opcao.texto, opcao.correta],
    );
  }
}

async function executarSeed() {
  const cliente = await pool.connect();
  try {
    const { rows } = await cliente.query("SELECT count(*)::int AS total FROM categorias");
    if (rows[0].total > 0) throw new Error("O banco já tem conteúdo. A carga inicial roda só uma vez.");

    await cliente.query("BEGIN");

    for (const [indiceCategoria, categoria] of categorias.entries()) {
      await cliente.query(
        "INSERT INTO categorias (categoria_id, nome, descricao, icone, ordem) VALUES ($1, $2, $3, $4, $5)",
        [categoria.categoriaId, categoria.categoriaNome, categoria.categoriaDescricao, categoria.categoriaIcone, indiceCategoria + 1],
      );

      for (const [indiceDuvida, duvida] of categoria.categoriaDuvidas.entries()) {
        await cliente.query(
          "INSERT INTO perguntas (pergunta_id, categoria_id, enunciado, resposta, ordem) VALUES ($1, $2, $3, $4, $5)",
          [duvida.duvidaId, categoria.categoriaId, duvida.duvidaPergunta, duvida.duvidaResposta, indiceDuvida + 1],
        );
        await inserirAlternativas(cliente, duvida.duvidaId, validarOpcoes(duvida.duvidaId, alternativasQuiz[duvida.duvidaId]));
      }
    }

    for (const [categoriaId, derivadas] of Object.entries(perguntasQuizDerivadas)) {
      for (const [indiceDerivada, derivada] of derivadas.entries()) {
        await cliente.query(
          "INSERT INTO perguntas (pergunta_id, categoria_id, pergunta_base_id, enunciado, ordem) VALUES ($1, $2, $3, $4, $5)",
          [derivada.duvidaId, categoriaId, derivada.baseDuvidaId, derivada.duvidaPergunta, indiceDerivada + 1],
        );
        await inserirAlternativas(cliente, derivada.duvidaId, validarOpcoes(derivada.duvidaId, derivada.opcoesResposta));
      }
    }

    await cliente.query("COMMIT");
    console.log("Carga inicial concluída.");
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
    await pool.end();
  }
}

executarSeed().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
