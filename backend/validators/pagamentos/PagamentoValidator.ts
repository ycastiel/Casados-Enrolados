import { z } from "zod";

function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

function cpfValido(valor: string) {
  const cpf = somenteDigitos(valor);

  if (
    cpf.length !== 11 ||
    /^(\d)\1{10}$/.test(cpf)
  ) {
    return false;
  }

  const calcularDigito = (
    tamanho: number,
  ) => {
    let soma = 0;

    for (let indice = 0; indice < tamanho; indice += 1) {
      soma += Number(cpf[indice]) * (tamanho + 1 - indice);
    }

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    calcularDigito(9) === Number(cpf[9]) &&
    calcularDigito(10) === Number(cpf[10])
  );
}

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

  documento: z
    .string()
    .trim()
    .transform(somenteDigitos)
    .refine(cpfValido, "Informe um CPF válido."),
});

export type PagamentoIdParams =
  z.infer<typeof pagamentoIdSchema>;

export type CriarPagamentoPixBody =
  z.infer<typeof criarPagamentoPixSchema>;
