import { Router } from "express";

import {
  cadastrarConvidado,
  cadastrarConvite,
  editarConvidado,
  editarConvite,
  excluirConvidado,
  excluirConvite,
  obterConvites,
} from "../../controllers/relacoes/ConviteController.js";

import { validarRequisicao } from "../../validators/helpers/RequisicaoValidator.js";

import {
  atualizarConvidadoSchema,
  atualizarConviteSchema,
  conviteIdSchema,
  criarConviteSchema,
  convidadoSchema,
  idSchema,
} from "../../validators/relacoes/ConviteValidator.js";

export const conviteAdminRouter = Router();

conviteAdminRouter.get(
  "/",
  obterConvites,
);

conviteAdminRouter.post(
  "/",
  validarRequisicao(
    criarConviteSchema,
    "body",
  ),
  cadastrarConvite,
);

conviteAdminRouter.patch(
  "/:id",
  validarRequisicao(
    idSchema,
    "params",
  ),
  validarRequisicao(
    atualizarConviteSchema,
    "body",
  ),
  editarConvite,
);

conviteAdminRouter.delete(
  "/:id",
  validarRequisicao(
    idSchema,
    "params",
  ),
  excluirConvite,
);

conviteAdminRouter.post(
  "/:conviteId/convidados",
  validarRequisicao(
    conviteIdSchema,
    "params",
  ),
  validarRequisicao(
    convidadoSchema,
    "body",
  ),
  cadastrarConvidado,
);

conviteAdminRouter.patch(
  "/convidados/:id",
  validarRequisicao(
    idSchema,
    "params",
  ),
  validarRequisicao(
    atualizarConvidadoSchema,
    "body",
  ),
  editarConvidado,
);

conviteAdminRouter.delete(
  "/convidados/:id",
  validarRequisicao(
    idSchema,
    "params",
  ),
  excluirConvidado,
);
