import { Router } from "express";

import { obterCasamento } from "../../controllers/evento/CasamentoController.js";

export const casamentoRouter = Router();

casamentoRouter.get("/", obterCasamento);