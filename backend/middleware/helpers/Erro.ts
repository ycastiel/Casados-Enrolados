import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { ambiente } from "../../config/Ambiente.js";
import { ErroAplicacao } from "../../service/helpers/erros/ErrosIndex.js";

export const tratarErro: ErrorRequestHandler = (
  erro,
  req,
  res,
  _next,
) => {
  /*
   * Erros que nós mesmos lançamos conscientemente.
   */
  if (erro instanceof ErroAplicacao) {
    res.status(erro.statusHttp).json({
      erro: {
        codigo: erro.codigo,
        mensagem: erro.message,

        ...(erro.detalhes !== undefined && {
          detalhes: erro.detalhes,
        }),
      },
    });

    return;
  }

  /*
   * Erros de validação do Zod.
   *
   * Isso ficará especialmente útil quando começarmos
   * POST / PUT / PATCH.
   */
  if (erro instanceof ZodError) {
    res.status(400).json({
      erro: {
        codigo: "DADOS_INVALIDOS",
        mensagem: "Os dados enviados são inválidos.",

        detalhes: erro.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message,
        })),
      },
    });

    return;
  }

  /*
   * Qualquer erro que chegou até aqui é inesperado.
   *
   * O cliente recebe uma mensagem genérica.
   * O erro verdadeiro permanece somente no servidor.
   */
  console.error(
    `[${req.method}] ${req.originalUrl}`,
    erro,
  );

  if (ambiente.NODE_ENV === "development") {
    console.error(
      "Erro inesperado capturado pelo middleware global.",
    );
  }

  res.status(500).json({
    erro: {
      codigo: "ERRO_INTERNO",
      mensagem: "Ocorreu um erro interno no servidor.",
    },
  });
};