import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { ambiente } from "./config/ambiente.ts";
import { identificarVisitante } from "./middlewares/visitante.ts";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/erros.ts";
import { rotasAuth } from "./modulos/auth/auth.rotas.ts";
import { rotasConteudo } from "./modulos/conteudo/conteudo.rotas.ts";
import { rotasProgresso } from "./modulos/conteudo/progresso.rotas.ts";
import { rotasQuizIndividual } from "./modulos/quiz/quiz.rotas.ts";
import { rotasSalas } from "./modulos/salas/salas.rotas.ts";

export function criarAplicacao() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use("/api", identificarVisitante);

  app.get("/api/saude", (_req, res) => res.json({ ok: true }));
  app.use("/api", rotasConteudo);
  app.use("/api/progresso", rotasProgresso);
  app.use("/api/quiz", rotasQuizIndividual);
  app.use("/api/auth", rotasAuth);
  app.use("/api/salas", rotasSalas);

  if (ambiente.pastaFrontend) {
    app.use(express.static(ambiente.pastaFrontend));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.resolve(ambiente.pastaFrontend, "index.html"));
    });
  }

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
