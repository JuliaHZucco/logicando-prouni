import type { NextFunction, Request, Response } from "express";
import { banco } from "../banco/pool.ts";

export const nomeCookieVisitante = "visitante";
const umAnoEmMs = 365 * 24 * 60 * 60 * 1000;
const formatoUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function buscarVisitantePorToken(token: string | undefined): Promise<number | null> {
  if (!token || !formatoUuid.test(token)) return null;
  const { rows } = await banco.query<{ visitante_id: number }>(
    "UPDATE visitantes SET data_ultimo_acesso = now() WHERE token = $1 RETURNING visitante_id",
    [token],
  );
  return rows[0]?.visitante_id ?? null;
}

export async function identificarVisitante(req: Request, _res: Response, next: NextFunction) {
  req.visitanteId = (await buscarVisitantePorToken(req.cookies[nomeCookieVisitante])) ?? undefined;
  next();
}

export async function exigirVisitante(req: Request, res: Response, next: NextFunction) {
  if (!req.visitanteId) {
    const { rows } = await banco.query<{ visitante_id: number; token: string }>(
      "INSERT INTO visitantes DEFAULT VALUES RETURNING visitante_id, token",
    );
    req.visitanteId = rows[0].visitante_id;
    res.cookie(nomeCookieVisitante, rows[0].token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: umAnoEmMs,
    });
  }
  next();
}
