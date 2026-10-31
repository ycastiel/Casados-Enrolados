import { z } from "zod";

// O módulo de caminhos localiza a raiz do monorepo e carrega o .env uma única vez.
import "./Caminhos.js";

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

  MERCADO_PAGO_ACCESS_TOKEN: z
    .string()
    .trim()
    .min(1)
    .optional(),

  MERCADO_PAGO_WEBHOOK_SECRET: z
    .string()
    .trim()
    .min(1)
    .optional(),
});

const resultadoAmbiente = schemaAmbiente.safeParse(process.env);

if (!resultadoAmbiente.success) {
  console.error("❌ Variáveis de ambiente inválidas:\n");
  console.error(z.prettifyError(resultadoAmbiente.error));

  throw new Error("Falha ao validar as variáveis de ambiente.");
}

export const ambiente = Object.freeze(resultadoAmbiente.data);
export type Ambiente = z.infer<typeof schemaAmbiente>;
