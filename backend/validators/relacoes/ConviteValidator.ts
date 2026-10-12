import { z } from "zod";

const textoOpcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo)
    .optional();

const emailOpcional = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .email("Informe um e-mail válido."),
  ])
  .optional();

export const convidadoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do convidado.")
    .max(120, "O nome pode ter no máximo 120 caracteres."),

  email: emailOpcional,

  telefone: textoOpcional(30),

  restricaoAlimentar: textoOpcional(300),

  observacao: textoOpcional(500),
});

export const criarConviteSchema = z.object({
  nomeExibicao: z
    .string()
    .trim()
    .min(2, "Informe um nome para o convite ou grupo.")
    .max(120, "O nome do convite pode ter no máximo 120 caracteres."),

  mensagem: textoOpcional(500),

  observacaoInterna: textoOpcional(1000),

  convidados: z
    .array(convidadoSchema)
    .min(1, "Adicione pelo menos um convidado.")
    .max(30, "Um convite pode ter no máximo 30 convidados nesta etapa."),
});

export const atualizarConviteSchema = z
  .object({
    nomeExibicao: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .optional(),

    mensagem: textoOpcional(500),

    observacaoInterna: textoOpcional(1000),

    ativo: z.boolean().optional(),
  })
  .refine(
    (dados) =>
      Object.values(dados).some(
        (valor) => valor !== undefined,
      ),
    {
      message:
        "Envie pelo menos um campo para atualizar o convite.",
    },
  );

export const atualizarConvidadoSchema = convidadoSchema
  .partial()
  .refine(
    (dados) =>
      Object.values(dados).some(
        (valor) => valor !== undefined,
      ),
    {
      message:
        "Envie pelo menos um campo para atualizar o convidado.",
    },
  );

export const idSchema = z.object({
  id: z
    .string()
    .uuid("O identificador informado é inválido."),
});

export const conviteIdSchema = z.object({
  conviteId: z
    .string()
    .uuid("O identificador do convite é inválido."),
});

export type CriarConviteDados =
  z.infer<typeof criarConviteSchema>;

export type AtualizarConviteDados =
  z.infer<typeof atualizarConviteSchema>;

export type ConvidadoDados =
  z.infer<typeof convidadoSchema>;

export type AtualizarConvidadoDados =
  z.infer<typeof atualizarConvidadoSchema>;

export type IdParams =
  z.infer<typeof idSchema>;

export type ConviteIdParams =
  z.infer<typeof conviteIdSchema>;
