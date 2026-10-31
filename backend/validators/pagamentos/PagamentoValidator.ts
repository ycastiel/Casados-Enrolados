import { z } from "zod";

export const pagamentoIdSchema = z.object({
  id: z
    .string()
    .uuid("O identificador do pagamento é inválido."),
});

export const criarPagamentoPixSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),
});

export type PagamentoIdParams =
  z.infer<typeof pagamentoIdSchema>;

export type CriarPagamentoPixBody =
  z.infer<typeof criarPagamentoPixSchema>;
