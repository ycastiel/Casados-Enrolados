import type { RequestHandler } from "express";

import { buscarCasamento } from "../../services/eventos/Casamento.js";

export const obterCasamento: RequestHandler = async (
  _req,
  res,
) => {
  const dados = await buscarCasamento();

  res.status(200).json({
    dados,
  });
};