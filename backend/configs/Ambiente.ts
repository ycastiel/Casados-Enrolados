import { z } from "zod";

import "./Caminhos.js";

/*
 * Converte as strings vindas do .env ("true" | "false") em boolean.
 *
 * Depois do transform, o tipo de saída é boolean.
 * Portanto o valor padrão também precisa ser boolean.
 */
const booleanoEnv = z
  .enum(["true", "false"])
  .transform((valor) => valor === "true");

/*
 * Permite que segredos opcionais fiquem ausentes ou vazios no .env.
 */
const segredoOpcional = z.preprocess(
  (valor) =>
    typeof valor === "string" && valor.trim() === ""
      ? undefined
      : valor,
  z.string().trim().min(1).optional(),
);

const schemaAmbiente = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3000),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL não foi definida."),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET deve possuir pelo menos 32 caracteres."),

  MERCADO_PAGO_ACCESS_TOKEN: segredoOpcional,
  MERCADO_PAGO_WEBHOOK_SECRET: segredoOpcional,

  /*
   * Somente para o cenário oficial de teste do PIX na Orders API.
   *
   * Quando true, o backend pode enviar payer.first_name="APRO"
   * no ambiente de testes. Mantenha false em produção.
   */
  MERCADO_PAGO_PIX_TESTE_APROVAR_AUTOMATICAMENTE:
    booleanoEnv.default(false),
});

const resultadoAmbiente =
  schemaAmbiente.safeParse(process.env);

if (!resultadoAmbiente.success) {
  console.error(
    "❌ Variáveis de ambiente inválidas:",
  );
  console.error();
  console.error(
    z.prettifyError(resultadoAmbiente.error),
  );

  throw new Error(
    "Falha ao validar as variáveis de ambiente.",
  );
}

export const ambiente =
  Object.freeze(resultadoAmbiente.data);

export type Ambiente =
  z.infer<typeof schemaAmbiente>;
