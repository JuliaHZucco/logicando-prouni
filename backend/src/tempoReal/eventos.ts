import { parse } from "cookie";
import { banco } from "../banco/pool.ts";
import { lerModeradorDoToken, nomeCookieModerador } from "../middlewares/moderador.ts";
import { buscarVisitantePorToken, nomeCookieVisitante } from "../middlewares/visitante.ts";
import { avancar, encerrarPergunta, encerrarSala, jogarNovamente, responder } from "../modulos/salas/salas.service.ts";
import { canalModerador, canalSala, io } from "./io.ts";

type Confirmacao = (resposta: { ok: boolean; erro?: string }) => void;

export function registrarEventos() {
  io.use(async (socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie ?? "");
      socket.data.moderadorId = lerModeradorDoToken(cookies[nomeCookieModerador]);
      socket.data.visitanteId = await buscarVisitantePorToken(cookies[nomeCookieVisitante]);
      next();
    } catch {
      next(new Error("Falha ao identificar a conexão."));
    }
  });

  io.on("connection", (socket) => {
    const moderadorId: number | null = socket.data.moderadorId;
    const visitanteId: number | null = socket.data.visitanteId;

    socket.on("entrar-sala", async (codigo: string, confirmar: Confirmacao) => {
      const { rows } = await banco.query<{ dono: boolean; participante: boolean }>(
        `SELECT s.moderador_id = $2 AS dono,
                EXISTS (SELECT 1 FROM participantes p WHERE p.sala_id = s.sala_id AND p.visitante_id = $3) AS participante
         FROM salas s WHERE s.codigo = $1`,
        [codigo, moderadorId, visitanteId],
      );
      const acesso = rows[0];
      if (!acesso || (!acesso.dono && !acesso.participante)) {
        confirmar({ ok: false, erro: "Sem acesso a esta sala." });
        return;
      }
      await socket.join(canalSala(codigo));
      if (acesso.dono) await socket.join(canalModerador(codigo));
      confirmar({ ok: true });
    });

    socket.on("responder", async (codigo: string, alternativaId: number, confirmar: Confirmacao) => {
      const aceita = visitanteId ? await responder(codigo, visitanteId, alternativaId) : false;
      confirmar(aceita ? { ok: true } : { ok: false, erro: "Resposta não aceita." });
    });

    socket.on("avancar", async (codigo: string, confirmar: Confirmacao) => {
      confirmar({ ok: moderadorId ? await avancar(codigo, moderadorId) : false });
    });

    socket.on("encerrar-pergunta", async (codigo: string, confirmar: Confirmacao) => {
      const { rows } = await banco.query<{ sala_id: number }>("SELECT sala_id FROM salas WHERE codigo = $1", [codigo]);
      confirmar({ ok: moderadorId && rows[0] ? await encerrarPergunta(rows[0].sala_id, moderadorId) : false });
    });

    socket.on("jogar-novamente", async (codigo: string, confirmar: Confirmacao) => {
      confirmar({ ok: moderadorId ? await jogarNovamente(codigo, moderadorId) : false });
    });

    socket.on("encerrar-sala", async (codigo: string, confirmar: Confirmacao) => {
      confirmar({ ok: moderadorId ? await encerrarSala(codigo, moderadorId) : false });
    });
  });
}
