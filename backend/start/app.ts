import express from "express";
import helmet from "helmet";

import { tratarErro } from "../middleware/Erro.js";
import { router } from "../route/indexRoutes.js";

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
 * Middleware de erro deve ficar depois das rotas.
 */
app.use(tratarErro);