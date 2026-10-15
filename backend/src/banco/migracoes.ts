import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { banco } from "./pool.ts";

const pastaMigracoes = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../database/migrations",
);

interface Migracao {
  nome: string;
  sql: string;
  checksum: string;
}

async function lerMigracoes(): Promise<Migracao[]> {
  const nomes = (await readdir(pastaMigracoes))
    .filter((nome) => /^\d+-.+\.sql$/i.test(nome))
    .sort((a, b) => a.localeCompare(b, "en"));

  return Promise.all(
    nomes.map(async (nome) => {
      const sql = await readFile(resolve(pastaMigracoes, nome), "utf8");
      return {
        nome,
        sql,
        checksum: createHash("sha256").update(sql).digest("hex"),
      };
    }),
  );
}

async function executarMigracoes() {
  const migracoes = await lerMigracoes();
  const cliente = await banco.connect();

  try {
    await cliente.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        nome VARCHAR(255) PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        aplicado_em TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { rows: aplicadas } = await cliente.query<{ nome: string; checksum: string }>(
      "SELECT nome, checksum FROM schema_migrations ORDER BY nome",
    );
    const mapaAplicadas = new Map(aplicadas.map((migracao) => [migracao.nome, migracao.checksum]));

    for (const migracao of migracoes) {
      const checksumAnterior = mapaAplicadas.get(migracao.nome);
      if (checksumAnterior === migracao.checksum) continue;
      if (checksumAnterior) {
        throw new Error(`A migração ${migracao.nome} foi alterada depois de aplicada.`);
      }

      console.log(`Aplicando ${migracao.nome}...`);
      await cliente.query("BEGIN");
      try {
        await cliente.query(migracao.sql);
        await cliente.query(
          "INSERT INTO schema_migrations (nome, checksum) VALUES ($1, $2)",
          [migracao.nome, migracao.checksum],
        );
        await cliente.query("COMMIT");
        console.log(`Migração ${migracao.nome} aplicada.`);
      } catch (erro) {
        await cliente.query("ROLLBACK");
        throw erro;
      }
    }

    console.log("Banco já está atualizado.");
  } finally {
    cliente.release();
    await banco.end();
  }
}

executarMigracoes().catch((erro) => {
  console.error("Não foi possível executar as migrações.", erro);
  process.exitCode = 1;
});
