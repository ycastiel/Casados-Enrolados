import { prisma } from "@casados/database";

import { ErroAplicacao } from "../helpers/erros/ErrosIndex.js";

import type {
  CriarReservaPresenteDados,
} from "../../validators/presentes/ReservaValidator.js";

const DURACAO_RESERVA_MINUTOS = 30;
const MAXIMO_TENTATIVAS_TRANSACAO = 3;

const selecaoReserva = {
  id: true,
  token: true,
  nomeResponsavel: true,
  emailResponsavel: true,
  quantidade: true,
  status: true,
  reservadoEm: true,
  expiraEm: true,
  concluidoEm: true,
  canceladoEm: true,

  presente: {
    select: {
      id: true,
      nome: true,
      descricao: true,
      tipo: true,
      valorUnitario: true,
      imagemUrl: true,
      urlExterna: true,
      quantidadeTotal: true,
    },
  },
};

function somarMinutos(
  data: Date,
  minutos: number,
) {
  return new Date(
    data.getTime() +
      minutos * 60 * 1000,
  );
}

function codigoErroPrisma(
  erro: unknown,
): string | null {
  if (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    typeof erro.code === "string"
  ) {
    return erro.code;
  }

  return null;
}

function serializarReserva<
  T extends {
    presente: {
      valorUnitario:
        | { toString(): string }
        | null;
    };
  },
>(reserva: T) {
  return {
    ...reserva,

    presente: {
      ...reserva.presente,

      valorUnitario:
        reserva.presente.valorUnitario
          ?.toString() ?? null,
    },
  };
}

export async function expirarReservasVencidas() {
  const agora = new Date();

  await prisma.reservaPresente.updateMany({
    where: {
      status: "RESERVADA",

      expiraEm: {
        lt: agora,
      },
    },

    data: {
      status: "EXPIRADA",
    },
  });
}

async function executarCriacaoReserva(
  presenteId: string,
  dados: CriarReservaPresenteDados,
) {
  const agora = new Date();

  return prisma.$transaction(
    async (tx) => {
      const presente =
        await tx.presente.findFirst({
          where: {
            id: presenteId,
            ativo: true,
          },

          select: {
            id: true,
            nome: true,
            quantidadeTotal: true,
          },
        });

      if (!presente) {
        throw ErroAplicacao.naoEncontrado(
          "Presente não encontrado.",
          "PRESENTE_NAO_ENCONTRADO",
        );
      }

      const reservado =
        await tx.reservaPresente.aggregate({
          where: {
            presenteId,

            OR: [
              {
                status: "CONCLUIDA",
              },

              {
                status: "RESERVADA",

                OR: [
                  {
                    expiraEm: null,
                  },
                  {
                    expiraEm: {
                      gt: agora,
                    },
                  },
                ],
              },
            ],
          },

          _sum: {
            quantidade: true,
          },
        });

      const quantidadeReservada =
        reservado._sum.quantidade ?? 0;

      const quantidadeDisponivel =
        Math.max(
          presente.quantidadeTotal -
            quantidadeReservada,
          0,
        );

      if (
        dados.quantidade >
        quantidadeDisponivel
      ) {
        throw ErroAplicacao.conflito(
          quantidadeDisponivel === 0
            ? "Este presente não está mais disponível."
            : `Restam apenas ${quantidadeDisponivel} unidade(s) deste presente.`,
          "PRESENTE_INDISPONIVEL",
        );
      }

      return tx.reservaPresente.create({
        data: {
          presenteId,

          nomeResponsavel:
            dados.nomeResponsavel,

          emailResponsavel:
            dados.emailResponsavel || null,

          quantidade:
            dados.quantidade,

          expiraEm: somarMinutos(
            agora,
            DURACAO_RESERVA_MINUTOS,
          ),
        },

        select: selecaoReserva,
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function criarReservaPresente(
  presenteId: string,
  dados: CriarReservaPresenteDados,
) {
  await expirarReservasVencidas();

  for (
    let tentativa = 1;
    tentativa <=
    MAXIMO_TENTATIVAS_TRANSACAO;
    tentativa += 1
  ) {
    try {
      const reserva =
        await executarCriacaoReserva(
          presenteId,
          dados,
        );

      return serializarReserva(
        reserva,
      );
    } catch (erro) {
      const codigo =
        codigoErroPrisma(erro);

      const podeTentarNovamente =
        codigo === "P2034" &&
        tentativa <
          MAXIMO_TENTATIVAS_TRANSACAO;

      if (podeTentarNovamente) {
        continue;
      }

      throw erro;
    }
  }

  throw new Error(
    "Não foi possível concluir a reserva.",
  );
}

export async function buscarReservaPorToken(
  token: string,
) {
  await expirarReservasVencidas();

  const reserva =
    await prisma.reservaPresente.findUnique({
      where: {
        token,
      },

      select: selecaoReserva,
    });

  if (!reserva) {
    throw ErroAplicacao.naoEncontrado(
      "Reserva não encontrada.",
      "RESERVA_NAO_ENCONTRADA",
    );
  }

  return serializarReserva(reserva);
}

export async function cancelarReservaPorToken(
  token: string,
) {
  await expirarReservasVencidas();

  const reserva =
    await prisma.reservaPresente.findUnique({
      where: {
        token,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!reserva) {
    throw ErroAplicacao.naoEncontrado(
      "Reserva não encontrada.",
      "RESERVA_NAO_ENCONTRADA",
    );
  }

  if (
    reserva.status === "CONCLUIDA"
  ) {
    throw ErroAplicacao.conflito(
      "Uma reserva concluída não pode ser cancelada.",
      "RESERVA_JA_CONCLUIDA",
    );
  }

  if (
    reserva.status === "EXPIRADA"
  ) {
    throw ErroAplicacao.conflito(
      "Esta reserva já expirou.",
      "RESERVA_EXPIRADA",
    );
  }

  if (
    reserva.status === "CANCELADA"
  ) {
    return buscarReservaPorToken(
      token,
    );
  }

  const atualizada =
    await prisma.reservaPresente.update({
      where: {
        id: reserva.id,
      },

      data: {
        status: "CANCELADA",
        canceladoEm: new Date(),
      },

      select: selecaoReserva,
    });

  return serializarReserva(atualizada);
}
