import { createServer } from "node:http";
import { ambiente } from "./config/ambiente.ts";
import { criarAplicacao } from "./app.ts";
import { banco } from "./banco/pool.ts";
import { retomarCronometros } from "./modulos/salas/salas.service.ts";
import { registrarEventos } from "./tempoReal/eventos.ts";
import { io } from "./tempoReal/io.ts";

const servidor = createServer(criarAplicacao());
io.attach(servidor);
registrarEventos();

servidor.listen(ambiente.porta, async () => {
  await retomarCronometros();
  console.log(`Backend em http://localhost:${ambiente.porta}`);
});

async function encerrar(sinal: string) {
  console.log(`Recebido ${sinal}. Encerrando o backend...`);
  io.close();
  servidor.close(async (erro) => {
    if (erro) {
      console.error("Não foi possível encerrar o servidor HTTP.", erro);
      process.exitCode = 1;
    }

    await banco.end();
  });
}

process.once("SIGINT", () => void encerrar("SIGINT"));
process.once("SIGTERM", () => void encerrar("SIGTERM"));
