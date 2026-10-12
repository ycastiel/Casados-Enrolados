import { Router } from "express";

import { casamentoRouter } from "./evento/CasamentoRoutes.js";

export const router = Router();

router.use("/casamento", casamentoRouter);