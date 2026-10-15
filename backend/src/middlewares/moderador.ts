import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ambiente } from "../config/ambiente.ts";

export const nomeCookieModerador = "moderador";

export function criarTokenModerador(moderadorId: number): string {
  return jwt.sign({ moderadorId }, ambiente.jwtSegredo, { expiresIn: "12h" });
}

export function lerModeradorDoToken(token: string | undefined): number | null {
  if (!token) return null;
  try {
    const conteudo = jwt.verify(token, ambiente.jwtSegredo) as { moderadorId: number };
    return conteudo.moderadorId;
  } catch {
    return null;
  }
}

export function exigirModerador(req: Request, res: Response, next: NextFunction) {
  const moderadorId = lerModeradorDoToken(req.cookies[nomeCookieModerador]);
  if (!moderadorId) {
    res.status(401).json({ erro: "Faça login como moderador." });
    return;
  }
  req.moderadorId = moderadorId;
  next();
}
