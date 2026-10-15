import type { ErrorRequestHandler, RequestHandler } from "express";
import { ErroHttp } from "../erros.ts";

export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({
    erro: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
};

export const tratarErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  console.error(erro);

  if (erro instanceof ErroHttp) {
    res.status(erro.status).json({ erro: erro.message });
    return;
  }

  if (erro instanceof SyntaxError && "body" in erro) {
    res.status(400).json({ erro: "JSON inválido." });
    return;
  }

  res.status(500).json({ erro: "Erro interno no servidor." });
};
