import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { ZodType } from "zod";

type OrigemValidacao =
  | "body"
  | "params"
  | "query";

export function validarRequisicao(
  schema: ZodType,
  origem: OrigemValidacao = "body",
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dados = schema.parse(req[origem]);

      /*
       * Guardamos os dados já validados e transformados
       * em res.locals.
       *
       * Isso é especialmente útil para query strings,
       * que não devemos tentar sobrescrever diretamente.
       */
      res.locals.validado = dados;

      next();
    } catch (erro) {
      next(erro);
    }
  };
}