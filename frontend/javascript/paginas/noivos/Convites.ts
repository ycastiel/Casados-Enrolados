export type StatusConfirmacao =
  | "PENDENTE"
  | "CONFIRMADO"
  | "RECUSADO";

export type ConfirmacaoAdmin = {
  id: string;
  status: StatusConfirmacao;
  observacao: string | null;
  respondidoEm: string | null;

  evento: {
    id: string;
    nome: string;
    tipo: string;
    inicioEm: string;
  };
};

export type ConvidadoAdmin = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  restricaoAlimentar: string | null;
  observacao: string | null;
  criadoEm: string;
  atualizadoEm: string;
  confirmacoes: ConfirmacaoAdmin[];
};

export type ConviteAdmin = {
  id: string;
  nomeExibicao: string;
  token: string;
  mensagem: string | null;
  observacaoInterna: string | null;
  ativo: boolean;
  enviadoEm: string | null;
  expiraEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
  convidados: ConvidadoAdmin[];
};

export type NovoConvidado = {
  nome: string;
  email?: string;
  telefone?: string;
  restricaoAlimentar?: string;
  observacao?: string;
};

export type NovoConvite = {
  nomeExibicao: string;
  mensagem?: string;
  observacaoInterna?: string;
  convidados: NovoConvidado[];
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

export async function listarConvitesAdmin() {
  const resposta = await requisicao<{
    dados: {
      convites: ConviteAdmin[];
    };
  }>("/api/admin/convites");

  return resposta.dados.convites;
}

export async function criarConviteAdmin(
  dados: NovoConvite,
) {
  const resposta = await requisicao<{
    dados: {
      convite: ConviteAdmin;
    };
  }>("/api/admin/convites", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  return resposta.dados.convite;
}

export async function atualizarConviteAdmin(
  id: string,
  dados: Partial<
    Pick<
      ConviteAdmin,
      | "nomeExibicao"
      | "mensagem"
      | "observacaoInterna"
    >
  >,
) {
  const resposta = await requisicao<{
    dados: {
      convite: ConviteAdmin;
    };
  }>(
    `/api/admin/convites/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(dados),
    },
  );

  return resposta.dados.convite;
}

export async function removerConviteAdmin(
  id: string,
) {
  await requisicao<void>(
    `/api/admin/convites/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function adicionarConvidadoAdmin(
  conviteId: string,
  dados: NovoConvidado,
) {
  const resposta = await requisicao<{
    dados: {
      convidado: ConvidadoAdmin;
    };
  }>(
    `/api/admin/convites/${conviteId}/convidados`,
    {
      method: "POST",
      body: JSON.stringify(dados),
    },
  );

  return resposta.dados.convidado;
}

export async function atualizarConvidadoAdmin(
  id: string,
  dados: Partial<NovoConvidado>,
) {
  const resposta = await requisicao<{
    dados: {
      convidado: ConvidadoAdmin;
    };
  }>(
    `/api/admin/convites/convidados/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(dados),
    },
  );

  return resposta.dados.convidado;
}

export async function removerConvidadoAdmin(
  id: string,
) {
  await requisicao<void>(
    `/api/admin/convites/convidados/${id}`,
    {
      method: "DELETE",
    },
  );
}
