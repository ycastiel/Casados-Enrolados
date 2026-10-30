import { z } from "zod";

export const pagamentoIdSchema = z.object({
  id: z
    .string()
    .uuid("O identificador do pagamento é inválido."),
});

export type PagamentoIdParams =
  z.infer<typeof pagamentoIdSchema>;
