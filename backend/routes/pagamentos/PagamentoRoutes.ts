import { Router } from "express";

import {
  aprovarPagamentoManualAdmin,
  criarPagamentoReserva,
  obterPagamentosAdmin,
} from "../../controllers/pagamentos/PagamentoController.js";

import { validarRequisicao } from "../../validators/helpers/RequisicaoValidator.js";

import { tokenReservaSchema } from "../../validators/presentes/ReservaValidator.js";
import { pagamentoIdSchema } from "../../validators/pagamentos/PagamentoValidator.js";

export const pagamentoReservaRouter = Router();
export const pagamentoAdminRouter = Router();

pagamentoReservaRouter.post(
  "/:token/pagamentos",
  validarRequisicao(
    tokenReservaSchema,
    "params",
  ),
  criarPagamentoReserva,
);

pagamentoAdminRouter.get(
  "/",
  obterPagamentosAdmin,
);

pagamentoAdminRouter.post(
  "/:id/confirmar",
  validarRequisicao(
    pagamentoIdSchema,
    "params",
  ),
  aprovarPagamentoManualAdmin,
);
