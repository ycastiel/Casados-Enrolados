import type { RequestHandler } from "express";

import {
  buscarPagamentoAtualReserva,
  confirmarPagamentoManual,
  criarPagamentoPixReserva,
  listarPagamentosAdmin,
  prepararPagamentoReserva,
  processarOrderMercadoPago,
} from "../../services/pagamentos/Pagamentos.js";

import {
  validarAssinaturaWebhookMercadoPago,
} from "../../services/helpers/provedores/MercadoPago.js";

import type {
  TokenReservaParams,
} from "../../validators/presentes/ReservaValidator.js";

import type {
  CriarPagamentoPixBody,
  PagamentoIdParams,
} from "../../validators/pagamentos/PagamentoValidator.js";

import { ErroAplicacao } from "../../services/helpers/erros/ErrosIndex.js";

type Validado = {
  params?: unknown;
  body?: unknown;
};

export const criarPagamentoReserva: RequestHandler =
  async (_req, res) => {
    const validado = res.locals.validado as Validado;
    const { token } = validado.params as TokenReservaParams;

    const pagamento =
      await prepararPagamentoReserva(token);

    res.status(201).json({
      dados: { pagamento },
    });
  };

export const criarPagamentoPix: RequestHandler =
  async (_req, res) => {
    const validado = res.locals.validado as Validado;
    const { token } = validado.params as TokenReservaParams;
    const dados = validado.body as CriarPagamentoPixBody;

    const pagamento =
      await criarPagamentoPixReserva(token, dados);

    res.status(201).json({
      dados: { pagamento },
    });
  };

export const obterPagamentoAtualReserva: RequestHandler =
  async (_req, res) => {
    const validado = res.locals.validado as Validado;
    const { token } = validado.params as TokenReservaParams;

    const pagamento =
      await buscarPagamentoAtualReserva(token);

    res.status(200).json({
      dados: { pagamento },
    });
  };

export const webhookMercadoPago: RequestHandler =
  async (req, res) => {
    const dataIdQuery = req.query["data.id"];
    const dataId =
      typeof dataIdQuery === "string"
        ? dataIdQuery
        : typeof req.body?.data?.id === "string" ||
            typeof req.body?.data?.id === "number"
          ? String(req.body.data.id)
          : undefined;

    const assinaturaValida =
      validarAssinaturaWebhookMercadoPago({
        xSignature:
          typeof req.headers["x-signature"] === "string"
            ? req.headers["x-signature"]
            : undefined,
        xRequestId:
          typeof req.headers["x-request-id"] === "string"
            ? req.headers["x-request-id"]
            : undefined,
        dataId,
      });

    if (!assinaturaValida) {
      throw ErroAplicacao.naoAutorizado(
        "Assinatura do webhook inválida.",
        "WEBHOOK_MERCADO_PAGO_INVALIDO",
      );
    }

    const tipoQuery = req.query.type;
    const tipo =
      typeof tipoQuery === "string"
        ? tipoQuery
        : typeof req.body?.type === "string"
          ? req.body.type
          : undefined;
          
    if (dataId && (!tipo || tipo === "order")) {
      await processarOrderMercadoPago(dataId);
    }

    res.sendStatus(200);
  };

export const obterPagamentosAdmin: RequestHandler =
  async (_req, res) => {
    const pagamentos = await listarPagamentosAdmin();

    res.status(200).json({
      dados: { pagamentos },
    });
  };

export const aprovarPagamentoManualAdmin: RequestHandler =
  async (_req, res) => {
    const validado = res.locals.validado as Validado;
    const { id } = validado.params as PagamentoIdParams;

    const pagamento =
      await confirmarPagamentoManual(id);

    res.status(200).json({
      dados: { pagamento },
    });
  };
