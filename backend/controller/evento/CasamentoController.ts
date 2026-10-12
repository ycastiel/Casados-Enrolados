import type { NextFunction, Request, Response } from "express";

import { buscarCasamento } from "../../service/evento/Casamento.js";

export async function obterCasamento(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const dados = await buscarCasamento();

    if (!dados) {
      return res.status(404).json({
        erro: {
          codigo: "CASAMENTO_NAO_ENCONTRADO",
          mensagem: "Nenhum casamento ativo foi encontrado.",
        },
      });
    }

    return res.status(200).json({
      dados,
    });
  } catch (erro) {
    next(erro);
  }
}