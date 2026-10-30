import { Router } from "express";

import {
  cadastrarPresenteAdmin,
  editarPresenteAdmin,
  excluirPresenteAdmin,
  obterPresentesAdmin,
} from "../../controllers/presentes/PresenteController.js";

import { validarRequisicao } from "../../validators/helpers/RequisicaoValidator.js";

import {
  atualizarPresenteSchema,
  criarPresenteSchema,
  presenteIdSchema,
} from "../../validators/presentes/PresenteValidator.js";

export const presenteAdminRouter =
  Router();

presenteAdminRouter.get(
  "/",
  obterPresentesAdmin,
);

presenteAdminRouter.post(
  "/",
  validarRequisicao(
    criarPresenteSchema,
    "body",
  ),
  cadastrarPresenteAdmin,
);

presenteAdminRouter.patch(
  "/:id",
  validarRequisicao(
    presenteIdSchema,
    "params",
  ),
  validarRequisicao(
    atualizarPresenteSchema,
    "body",
  ),
  editarPresenteAdmin,
);

presenteAdminRouter.delete(
  "/:id",
  validarRequisicao(
    presenteIdSchema,
    "params",
  ),
  excluirPresenteAdmin,
);
