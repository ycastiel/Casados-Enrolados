import { z } from "zod";

export const presenteIdSchema = z.object({
  id: z
    .string()
    .uuid("O identificador do presente é inválido."),
});

export const tokenReservaSchema = z.object({
  token: z
    .string()
    .uuid("O token da reserva é inválido."),
});

export const criarReservaPresenteSchema = z.object({
  nomeResponsavel: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(
      120,
      "O nome pode ter no máximo 120 caracteres.",
    ),

  emailResponsavel: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .email("Informe um e-mail válido."),
    ])
    .optional(),

  quantidade: z
    .coerce
    .number()
    .int("A quantidade precisa ser um número inteiro.")
    .min(1, "Escolha pelo menos uma unidade.")
    .max(
      20,
      "Não é possível reservar mais de 20 unidades de uma só vez.",
    )
    .default(1),
});

export type PresenteIdParams =
  z.infer<typeof presenteIdSchema>;

export type TokenReservaParams =
  z.infer<typeof tokenReservaSchema>;

export type CriarReservaPresenteDados =
  z.infer<typeof criarReservaPresenteSchema>;
