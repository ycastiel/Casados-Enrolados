import { z } from "zod";

const textoOpcional = (maximo: number) =>
  z
    .union([
      z.literal(""),
      z.string().trim().max(maximo),
      z.null(),
    ])
    .optional();

const enderecoOpcional = z
  .union([
    z.literal(""),
    z.string().trim().max(1000),
    z.null(),
  ])
  .optional();

const valorUnitarioSchema = z
  .number()
  .min(0.01, "O valor deve ser maior que zero.")
  .max(
    99_999_999.99,
    "O valor informado é muito alto.",
  )
  .nullable();

export const presenteIdSchema = z.object({
  id: z
    .string()
    .uuid("O identificador do presente é inválido."),
});

export const criarPresenteSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do presente.")
    .max(
      120,
      "O nome pode ter no máximo 120 caracteres.",
    ),

  descricao: textoOpcional(1000),

  tipo: z
    .enum([
      "PRODUTO",
      "COTA",
    ])
    .default("PRODUTO"),

  valorUnitario:
    valorUnitarioSchema.optional(),

  imagemUrl: enderecoOpcional,
  urlExterna: enderecoOpcional,

  quantidadeTotal: z
    .number()
    .int()
    .min(1, "A quantidade deve ser pelo menos 1.")
    .max(9999, "A quantidade informada é muito alta.")
    .default(1),

  ativo: z.boolean().default(true),

  ordem: z
    .number()
    .int()
    .min(0, "A ordem não pode ser negativa.")
    .max(9999)
    .default(0),
});

export const atualizarPresenteSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .optional(),

    descricao: textoOpcional(1000),

    tipo: z
      .enum([
        "PRODUTO",
        "COTA",
      ])
      .optional(),

    valorUnitario:
      valorUnitarioSchema.optional(),

    imagemUrl: enderecoOpcional,
    urlExterna: enderecoOpcional,

    quantidadeTotal: z
      .number()
      .int()
      .min(1)
      .max(9999)
      .optional(),

    ativo: z.boolean().optional(),

    ordem: z
      .number()
      .int()
      .min(0)
      .max(9999)
      .optional(),
  })
  .refine(
    (dados) =>
      Object.values(dados).some(
        (valor) => valor !== undefined,
      ),
    {
      message:
        "Envie pelo menos um campo para atualizar o presente.",
    },
  );

export const removerImagemPresenteSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Informe a URL da imagem."),
});

export type CriarPresenteDados =
  z.infer<typeof criarPresenteSchema>;

export type AtualizarPresenteDados =
  z.infer<typeof atualizarPresenteSchema>;

export type PresenteIdParams =
  z.infer<typeof presenteIdSchema>;

export type RemoverImagemPresenteDados =
  z.infer<typeof removerImagemPresenteSchema>;
