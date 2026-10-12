import type { RequestHandler } from "express";

import {
  adicionarConvidado,
  atualizarConvidado,
  atualizarConvite,
  criarConvite,
  desativarConvite,
  listarConvites,
  removerConvidado,
} from "../../services/relacoes/Convites.js";

import type {
  AtualizarConvidadoDados,
  AtualizarConviteDados,
  ConvidadoDados,
  ConviteIdParams,
  CriarConviteDados,
  IdParams,
} from "../../validators/relacoes/ConviteValidator.js";

type Validado = {
  body?: unknown;
  params?: unknown;
};

export const obterConvites: RequestHandler =
  async (_req, res) => {
    const convites = await listarConvites();

    res.status(200).json({
      dados: {
        convites,
      },
    });
  };

export const cadastrarConvite: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const dados =
      validado.body as CriarConviteDados;

    const convite = await criarConvite(dados);

    res.status(201).json({
      dados: {
        convite,
      },
    });
  };

export const editarConvite: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as IdParams;

    const dados =
      validado.body as AtualizarConviteDados;

    const convite =
      await atualizarConvite(id, dados);

    res.status(200).json({
      dados: {
        convite,
      },
    });
  };

export const excluirConvite: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as IdParams;

    await desativarConvite(id);

    res.status(204).send();
  };

export const cadastrarConvidado: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { conviteId } =
      validado.params as ConviteIdParams;

    const dados =
      validado.body as ConvidadoDados;

    const convidado =
      await adicionarConvidado(
        conviteId,
        dados,
      );

    res.status(201).json({
      dados: {
        convidado,
      },
    });
  };

export const editarConvidado: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as IdParams;

    const dados =
      validado.body as AtualizarConvidadoDados;

    const convidado =
      await atualizarConvidado(id, dados);

    res.status(200).json({
      dados: {
        convidado,
      },
    });
  };

export const excluirConvidado: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as IdParams;

    await removerConvidado(id);

    res.status(204).send();
  };
