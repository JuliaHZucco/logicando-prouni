import { Router } from "express";
import bcrypt from "bcryptjs";
import { banco } from "../../banco/pool.ts";
import { producao } from "../../config/ambiente.ts";
import { criarTokenModerador, exigirModerador, nomeCookieModerador } from "../../middlewares/moderador.ts";

export const rotasAuth = Router();

rotasAuth.post("/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const senha = String(req.body?.senha ?? "");
  const { rows } = await banco.query<{ moderador_id: number; senha_hash: string }>(
    "SELECT moderador_id, senha_hash FROM moderadores WHERE email = $1",
    [email],
  );
  const moderador = rows[0];
  if (!moderador || !(await bcrypt.compare(senha, moderador.senha_hash))) {
    res.status(401).json({ erro: "E-mail ou senha incorretos." });
    return;
  }
  res.cookie(nomeCookieModerador, criarTokenModerador(moderador.moderador_id), {
    httpOnly: true,
    sameSite: "lax",
    secure: producao,
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.json({ email });
});

rotasAuth.get("/eu", exigirModerador, async (req, res) => {
  const { rows } = await banco.query("SELECT email FROM moderadores WHERE moderador_id = $1", [req.moderadorId]);
  res.json(rows[0]);
});

rotasAuth.post("/sair", (_req, res) => {
  res.clearCookie(nomeCookieModerador);
  res.status(204).end();
});
