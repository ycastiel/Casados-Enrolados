import type {
  ErrorRequestHandler,
} from "express";

export const tratarErro: ErrorRequestHandler = (
  erro,
  _req,
  res,
  _next,
) => {
  console.error(erro);

  res.status(500).json({
    erro: {
      codigo: "ERRO_INTERNO",
      mensagem: "Ocorreu um erro interno no servidor.",
    },
  });
};