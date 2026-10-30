import { Router } from "express";

import { casamentoRouter } from "./eventos/CasamentoRoutes.js";
import { conviteAdminRouter } from "./relacoes/ConviteRoutes.js";
import { pagamentoAdminRouter, pagamentoReservaRouter } from "./pagamentos/PagamentoRoutes.js";
import { presenteAdminRouter } from "./presentes/PresenteRoutes.js";

import {
  presenteReservaRouter,
  reservaPresenteRouter,
} from "./presentes/ReservaRoutes.js";

export const router = Router();

router.use(
  "/casamento",
  casamentoRouter,
);

router.use(
  "/presentes",
  presenteReservaRouter,
);

router.use(
  "/reservas",
  reservaPresenteRouter,
);

router.use(
  "/admin/convites",
  conviteAdminRouter,
);

router.use(
  "/admin/presentes",
  presenteAdminRouter,
);

router.use(
  "/reservas",
  pagamentoReservaRouter,
);

router.use(
  "/admin/pagamentos",
  pagamentoAdminRouter,
);
