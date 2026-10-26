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

      res.locals.validado = {
        ...(res.locals.validado ?? {}),
        [origem]: dados,
      };

      next();
    } catch (erro) {
      next(erro);
    }
  };
}
