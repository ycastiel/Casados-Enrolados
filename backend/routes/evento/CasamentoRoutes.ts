import { Router } from "express";

import { obterCasamento } from "../../controllers/eventos/CasamentoController.js";

export const casamentoRouter = Router();

casamentoRouter.get("/", obterCasamento);