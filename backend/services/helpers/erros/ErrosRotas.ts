import type { RequestHandler } from "express";

import { ErroAplicacao } from './ErrosIndex.js';

export const rotaNaoEncontrada: RequestHandler = (
  req,
  _res,
  next,
) => {
  next(
    ErroAplicacao.naoEncontrado(
      `A rota ${req.method} ${req.originalUrl} não existe.`,
      "ROTA_NAO_ENCONTRADA",
    ),
  );
};