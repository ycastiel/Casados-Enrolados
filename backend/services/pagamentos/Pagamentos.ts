import { prisma } from "@casados/database";

import { ErroAplicacao } from "../helpers/erros/ErrosIndex.js";
import { expirarReservasVencidas } from "../presentes/Reserva.js";

const STATUS_ABERTOS = [
  "PENDENTE",
  "PROCESSANDO",
] as const;

const selecaoPagamento = {
  id: true,
  status: true,
  provedor: true,
  metodo: true,
  valor: true,
  moeda: true,
  referenciaExterna: true,
  urlCheckout: true,
  codigoPixCopiaCola: true,
  qrCodePix: true,
  expiraEm: true,
  aprovadoEm: true,
  canceladoEm: true,
  criadoEm: true,
  atualizadoEm: true,

  reserva: {
    select: {
      id: true,
      token: true,
      nomeResponsavel: true,
      emailResponsavel: true,
      quantidade: true,
      status: true,
      expiraEm: true,

      presente: {
        select: {
          id: true,
          casamentoId: true,
          nome: true,
          tipo: true,
          valorUnitario: true,
          imagemUrl: true,
        },
      },
    },
  },
};

type PagamentoSelecionado = Awaited<
  ReturnType<typeof buscarPagamentoPorIdInterno>
>;

function serializarPagamento(
  pagamento: NonNullable<PagamentoSelecionado>,
) {
  return {
    ...pagamento,
    valor: pagamento.valor.toString(),
    reserva: {
      ...pagamento.reserva,
      presente: {
        ...pagamento.reserva.presente,
        valorUnitario:
          pagamento.reserva.presente.valorUnitario
            ?.toString() ?? null,
      },
    },
  };
}

async function buscarPagamentoPorIdInterno(
  id: string,
) {
  return prisma.pagamento.findUnique({
    where: { id },
    select: selecaoPagamento,
  });
}

export async function expirarPagamentosVencidos() {
  await prisma.pagamento.updateMany({
    where: {
      status: { in: [...STATUS_ABERTOS] },
      expiraEm: { lt: new Date() },
    },
    data: {
      status: "EXPIRADO",
    },
  });
}

export async function prepararPagamentoReserva(
  tokenReserva: string,
) {
  await expirarReservasVencidas();
  await expirarPagamentosVencidos();

  const reserva =
    await prisma.reservaPresente.findUnique({
      where: {
        token: tokenReserva,
      },
      select: {
        id: true,
        status: true,
        quantidade: true,
        expiraEm: true,
        presente: {
          select: {
            valorUnitario: true,
          },
        },
        pagamentos: {
          where: {
            status: {
              in: [
                "PENDENTE",
                "PROCESSANDO",
                "APROVADO",
              ],
            },
          },
          orderBy: {
            criadoEm: "desc",
          },
          take: 1,
          select: selecaoPagamento,
        },
      },
    });

  if (!reserva) {
    throw ErroAplicacao.naoEncontrado(
      "Reserva não encontrada.",
      "RESERVA_NAO_ENCONTRADA",
    );
  }

  if (reserva.status === "CONCLUIDA") {
    const aprovado = reserva.pagamentos.find(
      (pagamento) => pagamento.status === "APROVADO",
    );

    if (aprovado) {
      return serializarPagamento(aprovado);
    }

    throw ErroAplicacao.conflito(
      "Esta reserva já foi concluída.",
      "RESERVA_JA_CONCLUIDA",
    );
  }

  if (reserva.status !== "RESERVADA") {
    throw ErroAplicacao.conflito(
      "Somente uma reserva ativa pode iniciar um pagamento.",
      "RESERVA_NAO_PAGAVEL",
    );
  }

  const existente = reserva.pagamentos[0];

  if (existente) {
    return serializarPagamento(existente);
  }

  if (reserva.presente.valorUnitario === null) {
    throw ErroAplicacao.conflito(
      "Este presente ainda não possui um valor definido para pagamento online.",
      "PRESENTE_SEM_VALOR",
    );
  }

  const valorTotal = (
    Number(
      reserva.presente.valorUnitario.toString(),
    ) * reserva.quantidade
  ).toFixed(2);

  const pagamento =
    await prisma.pagamento.create({
      data: {
        reservaId: reserva.id,
        valor: valorTotal,
        moeda: "BRL",

        // Enquanto não houver gateway real, MANUAL representa
        // a tentativa local/de desenvolvimento.
        provedor: "MANUAL",
        status: "PENDENTE",
        expiraEm: reserva.expiraEm,
      },
      select: selecaoPagamento,
    });

  return serializarPagamento(pagamento);
}

export async function listarPagamentosAdmin() {
  await expirarReservasVencidas();
  await expirarPagamentosVencidos();

  const casamento =
    await prisma.casamento.findFirst({
      where: { ativo: true },
      select: { id: true },
    });

  if (!casamento) {
    throw ErroAplicacao.naoEncontrado(
      "Nenhum casamento ativo foi encontrado.",
      "CASAMENTO_NAO_ENCONTRADO",
    );
  }

  const pagamentos =
    await prisma.pagamento.findMany({
      where: {
        reserva: {
          presente: {
            casamentoId: casamento.id,
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
      select: selecaoPagamento,
    });

  return pagamentos.map(
    serializarPagamento,
  );
}

export async function confirmarPagamentoManual(
  pagamentoId: string,
) {
  await expirarReservasVencidas();
  await expirarPagamentosVencidos();

  const existente =
    await buscarPagamentoPorIdInterno(
      pagamentoId,
    );

  if (!existente) {
    throw ErroAplicacao.naoEncontrado(
      "Pagamento não encontrado.",
      "PAGAMENTO_NAO_ENCONTRADO",
    );
  }

  if (existente.status === "APROVADO") {
    return serializarPagamento(existente);
  }

  if (
    existente.status !== "PENDENTE" &&
    existente.status !== "PROCESSANDO"
  ) {
    throw ErroAplicacao.conflito(
      `O pagamento está com status ${existente.status} e não pode ser aprovado.`,
      "PAGAMENTO_NAO_APROVAVEL",
    );
  }

  if (existente.reserva.status !== "RESERVADA") {
    throw ErroAplicacao.conflito(
      "A reserva vinculada não está mais ativa.",
      "RESERVA_NAO_ATIVA",
    );
  }

  const agora = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.pagamento.update({
      where: { id: pagamentoId },
      data: {
        status: "APROVADO",
        provedor: "MANUAL",
        metodo: "OUTRO",
        aprovadoEm: agora,
      },
    });

    await tx.pagamento.updateMany({
      where: {
        reservaId: existente.reserva.id,
        id: { not: pagamentoId },
        status: {
          in: ["PENDENTE", "PROCESSANDO"],
        },
      },
      data: {
        status: "CANCELADO",
        canceladoEm: agora,
      },
    });

    await tx.reservaPresente.update({
      where: {
        id: existente.reserva.id,
      },
      data: {
        status: "CONCLUIDA",
        concluidoEm: agora,
      },
    });
  });

  const atualizado =
    await buscarPagamentoPorIdInterno(
      pagamentoId,
    );

  if (!atualizado) {
    throw new Error(
      "Pagamento confirmado, mas não foi possível relê-lo.",
    );
  }

  return serializarPagamento(atualizado);
}
