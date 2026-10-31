import { Router } from "express";

import {
  aprovarPagamentoManualAdmin,
  criarPagamentoPix,
  criarPagamentoReserva,
  obterPagamentoAtualReserva,
  obterPagamentosAdmin,
  webhookMercadoPago,
} from "../../controllers/pagamentos/PagamentoController.js";

import { validarRequisicao } from "../../validators/helpers/RequisicaoValidator.js";
import { tokenReservaSchema } from "../../validators/presentes/ReservaValidator.js";
import {
  criarPagamentoPixSchema,
  pagamentoIdSchema,
} from "../../validators/pagamentos/PagamentoValidator.js";

export const pagamentoReservaRouter = Router();
export const pagamentoAdminRouter = Router();
export const pagamentoWebhookRouter = Router();

pagamentoReservaRouter.post(
  "/:token/pagamentos",
  validarRequisicao(tokenReservaSchema, "params"),
  criarPagamentoReserva,
);

pagamentoReservaRouter.post(
  "/:token/pagamentos/pix",
  validarRequisicao(tokenReservaSchema, "params"),
  validarRequisicao(criarPagamentoPixSchema, "body"),
  criarPagamentoPix,
);

pagamentoReservaRouter.get(
  "/:token/pagamentos/atual",
  validarRequisicao(tokenReservaSchema, "params"),
  obterPagamentoAtualReserva,
);

pagamentoAdminRouter.get(
  "/",
  obterPagamentosAdmin,
);

pagamentoAdminRouter.post(
  "/:id/confirmar",
  validarRequisicao(pagamentoIdSchema, "params"),
  aprovarPagamentoManualAdmin,
);

pagamentoWebhookRouter.post(
  "/",
  webhookMercadoPago,
);
