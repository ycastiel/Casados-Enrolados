import { Router } from "express";

import { casamentoRouter } from "./evento/CasamentoRoutes.js";
import { conviteAdminRouter } from "./relacoes/ConviteRoutes.js";

export const router = Router();

router.use(
  "/casamento",
  casamentoRouter,
);

router.use(
  "/admin/convites",
  conviteAdminRouter,
);
