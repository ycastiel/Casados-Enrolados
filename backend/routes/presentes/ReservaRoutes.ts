import { Router } from "express";

import {
  cadastrarReservaPresente,
  cancelarReservaPresente,
  obterReservaPresente,
} from "../../controllers/presentes/ReservaController.js";

import { validarRequisicao } from "../../validators/helpers/RequisicaoValidator.js";

import {
  criarReservaPresenteSchema,
  presenteIdSchema,
  tokenReservaSchema,
} from "../../validators/presentes/ReservaValidator.js";

export const presenteReservaRouter =
  Router();

export const reservaPresenteRouter =
  Router();

presenteReservaRouter.post(
  "/:id/reservas",
  validarRequisicao(
    presenteIdSchema,
    "params",
  ),
  validarRequisicao(
    criarReservaPresenteSchema,
    "body",
  ),
  cadastrarReservaPresente,
);

reservaPresenteRouter.get(
  "/:token",
  validarRequisicao(
    tokenReservaSchema,
    "params",
  ),
  obterReservaPresente,
);

reservaPresenteRouter.post(
  "/:token/cancelar",
  validarRequisicao(
    tokenReservaSchema,
    "params",
  ),
  cancelarReservaPresente,
);
