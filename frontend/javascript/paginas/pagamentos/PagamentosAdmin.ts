export type StatusPagamentoAdmin =
  | "PENDENTE"
  | "PROCESSANDO"
  | "APROVADO"
  | "RECUSADO"
  | "CANCELADO"
  | "ESTORNADO"
  | "EXPIRADO";

export type PagamentoAdmin = {
  id: string;
  status: StatusPagamentoAdmin;
  provedor: "MANUAL" | "MERCADO_PAGO" | "PAGARME";
  metodo: "PIX" | "CARTAO" | "BOLETO" | "OUTRO" | null;
  valor: string;
  moeda: string;
  referenciaExterna: string | null;
  urlCheckout: string | null;
  expiraEm: string | null;
  aprovadoEm: string | null;
  canceladoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
  reserva: {
    id: string;
    token: string;
    nomeResponsavel: string;
    emailResponsavel: string | null;
    quantidade: number;
    status: "RESERVADA" | "CONCLUIDA" | "CANCELADA" | "EXPIRADA";
    expiraEm: string | null;
    presente: {
      id: string;
      casamentoId: string;
      nome: string;
      tipo: "PRODUTO" | "COTA";
      valorUnitario: string | null;
      imagemUrl: string | null;
    };
  };
};

type ErroResposta = {
  erro?: { mensagem?: string };
};

async function requisicao<T>(
  caminho: string,
  opcoes?: RequestInit,
): Promise<T> {
  const resposta = await fetch(caminho, {
    ...opcoes,
    headers: {
      Accept: "application/json",
      ...opcoes?.headers,
    },
  });

  const corpo =
    resposta.status !== 204
      ? ((await resposta.json()) as unknown)
      : null;

  if (!resposta.ok) {
    const erro = corpo as ErroResposta | null;
    throw new Error(
      erro?.erro?.mensagem ??
        "Não foi possível concluir a operação.",
    );
  }

  return corpo as T;
}

export async function listarPagamentosAdmin() {
  const resposta =
    await requisicao<{
      dados: { pagamentos: PagamentoAdmin[] };
    }>("/api/admin/pagamentos");

  return resposta.dados.pagamentos;
}

export async function confirmarPagamentoManualAdmin(
  id: string,
) {
  const resposta =
    await requisicao<{
      dados: { pagamento: PagamentoAdmin };
    }>(`/api/admin/pagamentos/${id}/confirmar`, {
      method: "POST",
    });

  return resposta.dados.pagamento;
}
