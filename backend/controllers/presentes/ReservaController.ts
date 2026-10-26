import type { RequestHandler } from "express";

import {
  buscarReservaPorToken,
  cancelarReservaPorToken,
  criarReservaPresente,
} from "../../services/presentes/Reserva.js";

import type {
  CriarReservaPresenteDados,
  PresenteIdParams,
  TokenReservaParams,
} from "../../validators/presentes/ReservaValidator.js";

type Validado = {
  body?: unknown;
  params?: unknown;
};

export const cadastrarReservaPresente:
  RequestHandler = async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as PresenteIdParams;

    const dados =
      validado.body as CriarReservaPresenteDados;

    const reserva =
      await criarReservaPresente(
        id,
        dados,
      );

    res.status(201).json({
      dados: {
        reserva,
      },
    });
  };

export const obterReservaPresente:
  RequestHandler = async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { token } =
      validado.params as TokenReservaParams;

    const reserva =
      await buscarReservaPorToken(
        token,
      );

    res.status(200).json({
      dados: {
        reserva,
      },
    });
  };

export const cancelarReservaPresente:
  RequestHandler = async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { token } =
      validado.params as TokenReservaParams;

    const reserva =
      await cancelarReservaPorToken(
        token,
      );

    res.status(200).json({
      dados: {
        reserva,
      },
    });
  };
