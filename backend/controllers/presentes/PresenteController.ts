import type { RequestHandler } from "express";

import {
  atualizarPresenteAdmin,
  criarPresenteAdmin,
  desativarPresenteAdmin,
  listarPresentesAdmin,
} from "../../services/presentes/Presentes.js";

import type {
  AtualizarPresenteDados,
  CriarPresenteDados,
  PresenteIdParams,
} from "../../validators/presentes/PresenteValidator.js";

type Validado = {
  body?: unknown;
  params?: unknown;
};

export const obterPresentesAdmin: RequestHandler =
  async (_req, res) => {
    const presentes =
      await listarPresentesAdmin();

    res.status(200).json({
      dados: {
        presentes,
      },
    });
  };

export const cadastrarPresenteAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const dados =
      validado.body as CriarPresenteDados;

    const presente =
      await criarPresenteAdmin(dados);

    res.status(201).json({
      dados: {
        presente,
      },
    });
  };

export const editarPresenteAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as PresenteIdParams;

    const dados =
      validado.body as AtualizarPresenteDados;

    const presente =
      await atualizarPresenteAdmin(
        id,
        dados,
      );

    res.status(200).json({
      dados: {
        presente,
      },
    });
  };

export const excluirPresenteAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as PresenteIdParams;

    await desativarPresenteAdmin(id);

    res.status(204).send();
  };
