export type StatusReserva =
  | "RESERVADA"
  | "CONCLUIDA"
  | "CANCELADA"
  | "EXPIRADA";

export type ReservaPresente = {
  id: string;
  token: string;
  nomeResponsavel: string;
  emailResponsavel: string | null;
  quantidade: number;
  status: StatusReserva;
  reservadoEm: string;
  expiraEm: string | null;
  concluidoEm: string | null;
  canceladoEm: string | null;

  presente: {
    id: string;
    nome: string;
    descricao: string | null;
    tipo: "PRODUTO" | "COTA";
    valorUnitario: string | null;
    imagemUrl: string | null;
    urlExterna: string | null;
    quantidadeTotal: number;
  };
};

export type CriarReservaDados = {
  nomeResponsavel: string;
  emailResponsavel?: string;
  quantidade: number;
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
  const resposta = await fetch(
    caminho,
    {
      ...opcoes,

      headers: {
        Accept:
          "application/json",

        ...(opcoes?.body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...opcoes?.headers,
      },
    },
  );

  const tipoConteudo =
    resposta.headers.get(
      "content-type",
    ) ?? "";

  const corpo =
    tipoConteudo.includes(
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

export async function criarReserva(
  presenteId: string,
  dados: CriarReservaDados,
) {
  const resposta =
    await requisicao<{
      dados: {
        reserva:
          ReservaPresente;
      };
    }>(
      `/api/presentes/${presenteId}/reservas`,
      {
        method: "POST",
        body: JSON.stringify(
          dados,
        ),
      },
    );

  return resposta.dados.reserva;
}

export async function buscarReserva(
  token: string,
) {
  const resposta =
    await requisicao<{
      dados: {
        reserva:
          ReservaPresente;
      };
    }>(
      `/api/reservas/${token}`,
    );

  return resposta.dados.reserva;
}

export async function cancelarReserva(
  token: string,
) {
  const resposta =
    await requisicao<{
      dados: {
        reserva:
          ReservaPresente;
      };
    }>(
      `/api/reservas/${token}/cancelar`,
      {
        method: "POST",
      },
    );

  return resposta.dados.reserva;
}
