import express from "express";
import helmet from "helmet";

import { tratarErro } from "../middlewares/helpers/Erro.js";
import { rotaNaoEncontrada } from "../services/helpers/erros/ErrosRotas.js";

import { router } from "../routes/indexRoutes.js";

export const app = express();

app.use(helmet());

app.use(express.json());

app.get("/api/saude", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api", router);

/*
 * Tudo que não encontrou rota chega aqui.
 */
app.use(rotaNaoEncontrada);

/*
 * Deve obrigatoriamente ser o último middleware.
 */
app.use(tratarErro);