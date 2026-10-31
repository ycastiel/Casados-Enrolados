export type StatusPagamento =
  | "PENDENTE"
  | "PROCESSANDO"
  | "APROVADO"
  | "RECUSADO"
  | "CANCELADO"
  | "ESTORNADO"
  | "EXPIRADO";

export type PagamentoPix = {
  id: string;
  status: StatusPagamento;
  provedor: "MANUAL" | "MERCADO_PAGO" | "PAGARME";
  metodo: "PIX" | "CARTAO" | "BOLETO" | "OUTRO" | null;
  valor: string;
  moeda: string;
  referenciaExterna: string | null;
  urlCheckout: string | null;
  codigoPixCopiaCola: string | null;
  qrCodePix: string | null;
  expiraEm: string | null;
  aprovadoEm: string | null;
  canceladoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

type RespostaErro = {
  erro?: {
    mensagem?: string;
  };
};

async function requisicao<T>(
  caminho: string,
  opcoes?: RequestInit,
): Promise<T> {
  const resposta = await fetch(caminho, {
    ...opcoes,
    headers: {
      Accept: "application/json",
      ...(opcoes?.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...opcoes?.headers,
    },
  });

  const corpo =
    resposta.status !== 204
      ? ((await resposta.json()) as unknown)
      : null;

  if (!resposta.ok) {
    const erro = corpo as RespostaErro | null;

    throw new Error(
      erro?.erro?.mensagem ??
        "Não foi possível concluir a operação.",
    );
  }

  return corpo as T;
}

export async function criarPagamentoPix(
  token: string,
  dados: {
    email: string;
  },
) {
  const resposta = await requisicao<{
    dados: { pagamento: PagamentoPix };
  }>(`/api/reservas/${token}/pagamentos/pix`, {
    method: "POST",
    body: JSON.stringify(dados),
  });

  return resposta.dados.pagamento;
}

export async function buscarPagamentoAtual(
  token: string,
) {
  const resposta = await requisicao<{
    dados: { pagamento: PagamentoPix | null };
  }>(`/api/reservas/${token}/pagamentos/atual`);

  return resposta.dados.pagamento;
}
