import type { RequestHandler } from "express";

import {
  confirmarPagamentoManual,
  listarPagamentosAdmin,
  prepararPagamentoReserva,
} from "../../services/pagamentos/Pagamentos.js";

import type {
  TokenReservaParams,
} from "../../validators/presentes/ReservaValidator.js";

import type {
  PagamentoIdParams,
} from "../../validators/pagamentos/PagamentoValidator.js";

type Validado = {
  params?: unknown;
};

export const criarPagamentoReserva: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { token } =
      validado.params as TokenReservaParams;

    const pagamento =
      await prepararPagamentoReserva(token);

    res.status(201).json({
      dados: { pagamento },
    });
  };

export const obterPagamentosAdmin: RequestHandler =
  async (_req, res) => {
    const pagamentos =
      await listarPagamentosAdmin();

    res.status(200).json({
      dados: { pagamentos },
    });
  };

export const aprovarPagamentoManualAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as PagamentoIdParams;

    const pagamento =
      await confirmarPagamentoManual(id);

    res.status(200).json({
      dados: { pagamento },
    });
  };
