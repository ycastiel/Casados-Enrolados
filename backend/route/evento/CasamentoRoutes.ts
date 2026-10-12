import { Router } from "express";

import { obterCasamento } from "../../controller/evento/CasamentoController.js";

export const casamentoRouter = Router();

casamentoRouter.get("/", obterCasamento);