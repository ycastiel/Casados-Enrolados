export type TipoPresenteAdmin =
  | "PRODUTO"
  | "COTA";

export type StatusReservaPresenteAdmin =
  | "RESERVADA"
  | "CONCLUIDA"
  | "CANCELADA"
  | "EXPIRADA";

export type ReservaPresenteAdmin = {
  id: string;
  token: string;
  nomeResponsavel: string;
  emailResponsavel: string | null;
  quantidade: number;
  status: StatusReservaPresenteAdmin;
  reservadoEm: string;
  expiraEm: string | null;
  concluidoEm: string | null;
  canceladoEm: string | null;
};

export type PresenteAdmin = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TipoPresenteAdmin;
  valorUnitario: string | null;
  imagemUrl: string | null;
  urlExterna: string | null;
  quantidadeTotal: number;
  quantidadeReservada: number;
  quantidadeConcluida: number;
  quantidadeDisponivel: number;
  ativo: boolean;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
  reservasAtivas: ReservaPresenteAdmin[];
};

export type SalvarPresenteAdmin = {
  nome: string;
  descricao?: string | null;
  tipo: TipoPresenteAdmin;
  valorUnitario?: number | null;
  imagemUrl?: string | null;
  urlExterna?: string | null;
  quantidadeTotal: number;
  ativo: boolean;
  ordem: number;
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
        ? {
            "Content-Type":
              "application/json",
          }
        : {}),

      ...opcoes?.headers,
    },
  });

  if (resposta.status === 204) {
    return undefined as T;
  }

  const tipoConteudo =
    resposta.headers.get("content-type") ?? "";

  const corpo = tipoConteudo.includes(
    "application/json",
  )
    ? ((await resposta.json()) as unknown)
    : null;

  if (!resposta.ok) {
    const erro =
      corpo as RespostaErro | null;

    throw new Error(
      erro?.erro?.mensagem ??
        "Não foi possível concluir a operação.",
    );
  }

  return corpo as T;
}

export async function listarPresentesAdmin() {
  const resposta = await requisicao<{
    dados: {
      presentes: PresenteAdmin[];
    };
  }>("/api/admin/presentes");

  return resposta.dados.presentes;
}

export async function criarPresenteAdmin(
  dados: SalvarPresenteAdmin,
) {
  const resposta = await requisicao<{
    dados: {
      presente: PresenteAdmin;
    };
  }>("/api/admin/presentes", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  return resposta.dados.presente;
}

export async function atualizarPresenteAdmin(
  id: string,
  dados: Partial<SalvarPresenteAdmin>,
) {
  const resposta = await requisicao<{
    dados: {
      presente: PresenteAdmin;
    };
  }>(
    `/api/admin/presentes/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(dados),
    },
  );

  return resposta.dados.presente;
}

export async function desativarPresenteAdmin(
  id: string,
) {
  await requisicao<void>(
    `/api/admin/presentes/${id}`,
    {
      method: "DELETE",
    },
  );
}
