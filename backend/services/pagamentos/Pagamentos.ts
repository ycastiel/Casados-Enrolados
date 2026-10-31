import { prisma } from "@casados/database";

import { ErroAplicacao } from "../helpers/erros/ErrosIndex.js";
import { expirarReservasVencidas } from "../presentes/Reserva.js";

import type {
  CriarPagamentoPixBody,
} from "../../validators/pagamentos/PagamentoValidator.js";

import {
  buscarPagamentoMercadoPago,
  criarPixMercadoPago,
  type PagamentoMercadoPago,
} from "../helpers/provedores/MercadoPago.js";

const STATUS_ABERTOS = [
  "PENDENTE",
  "PROCESSANDO",
] as const;

const PIX_DURACAO_MINUTOS = 31;
const MARGEM_RESERVA_APOS_PIX_MINUTOS = 5;

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

function somarMinutos(
  data: Date,
  minutos: number,
) {
  return new Date(
    data.getTime() + minutos * 60_000,
  );
}

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
      where: { token: tokenReserva },
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
          orderBy: { criadoEm: "desc" },
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
    Number(reserva.presente.valorUnitario.toString()) *
    reserva.quantidade
  ).toFixed(2);

  const pagamento =
    await prisma.pagamento.create({
      data: {
        reservaId: reserva.id,
        valor: valorTotal,
        moeda: "BRL",
        provedor: "MANUAL",
        status: "PENDENTE",
        expiraEm: reserva.expiraEm,
      },
      select: selecaoPagamento,
    });

  return serializarPagamento(pagamento);
}

function mapearStatusMercadoPago(
  status: string,
) {
  switch (status) {
    case "approved":
      return "APROVADO" as const;
    case "in_process":
      return "PROCESSANDO" as const;
    case "rejected":
      return "RECUSADO" as const;
    case "cancelled":
      return "CANCELADO" as const;
    case "refunded":
    case "charged_back":
      return "ESTORNADO" as const;
    case "pending":
    default:
      return "PENDENTE" as const;
  }
}

async function aplicarEstadoMercadoPago(
  remoto: PagamentoMercadoPago,
) {
  const idInterno =
    remoto.external_reference ?? undefined;

  const pagamento = idInterno
    ? await buscarPagamentoPorIdInterno(idInterno)
    : await prisma.pagamento.findUnique({
        where: {
          referenciaExterna: String(remoto.id),
        },
        select: selecaoPagamento,
      });

  if (!pagamento) {
    return null;
  }

  const valorRemoto = remoto.transaction_amount;

  if (
    typeof valorRemoto === "number" &&
    Math.abs(
      valorRemoto - Number(pagamento.valor.toString()),
    ) > 0.009
  ) {
    throw new ErroAplicacao(
      "O valor informado pelo provedor não corresponde ao pagamento local.",
      409,
      "PAGAMENTO_VALOR_DIVERGENTE",
    );
  }

  const status = mapearStatusMercadoPago(
    remoto.status,
  );

  const agora = new Date();
  const aprovadoEm = remoto.date_approved
    ? new Date(remoto.date_approved)
    : status === "APROVADO"
      ? agora
      : null;

  const expiraEm = remoto.date_of_expiration
    ? new Date(remoto.date_of_expiration)
    : pagamento.expiraEm;

  await prisma.$transaction(async (tx) => {
    await tx.pagamento.update({
      where: { id: pagamento.id },
      data: {
        status,
        provedor: "MERCADO_PAGO",
        metodo: "PIX",
        referenciaExterna: String(remoto.id),
        expiraEm,
        aprovadoEm,
        canceladoEm:
          status === "CANCELADO"
            ? agora
            : pagamento.canceladoEm,
      },
    });

    if (
      status === "APROVADO" &&
      pagamento.reserva.status === "RESERVADA"
    ) {
      await tx.reservaPresente.update({
        where: { id: pagamento.reserva.id },
        data: {
          status: "CONCLUIDA",
          concluidoEm: aprovadoEm ?? agora,
        },
      });

      await tx.pagamento.updateMany({
        where: {
          reservaId: pagamento.reserva.id,
          id: { not: pagamento.id },
          status: {
            in: ["PENDENTE", "PROCESSANDO"],
          },
        },
        data: {
          status: "CANCELADO",
          canceladoEm: agora,
        },
      });
    }
  });

  return buscarPagamentoPorIdInterno(
    pagamento.id,
  );
}

export async function criarPagamentoPixReserva(
  tokenReserva: string,
  dados: CriarPagamentoPixBody,
) {
  await expirarReservasVencidas();
  await expirarPagamentosVencidos();

  const reserva =
    await prisma.reservaPresente.findUnique({
      where: { token: tokenReserva },
      select: {
        id: true,
        status: true,
        quantidade: true,
        presente: {
          select: {
            nome: true,
            valorUnitario: true,
          },
        },
        pagamentos: {
          where: {
            status: {
              in: ["PENDENTE", "PROCESSANDO", "APROVADO"],
            },
          },
          orderBy: { criadoEm: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            provedor: true,
            qrCodePix: true,
            codigoPixCopiaCola: true,
            referenciaExterna: true,
            expiraEm: true,
          },
        },
      },
    });

  if (!reserva) {
    throw ErroAplicacao.naoEncontrado(
      "Reserva não encontrada.",
      "RESERVA_NAO_ENCONTRADA",
    );
  }

  if (reserva.status !== "RESERVADA") {
    throw ErroAplicacao.conflito(
      "Esta reserva não está disponível para iniciar um Pix.",
      "RESERVA_NAO_PAGAVEL",
    );
  }

  if (reserva.presente.valorUnitario === null) {
    throw ErroAplicacao.conflito(
      "Este presente não possui valor definido para pagamento online.",
      "PRESENTE_SEM_VALOR",
    );
  }

  const existente = reserva.pagamentos[0];

  if (
    existente?.provedor === "MERCADO_PAGO" &&
    existente.status !== "APROVADO" &&
    existente.qrCodePix &&
    existente.codigoPixCopiaCola &&
    (!existente.expiraEm || existente.expiraEm > new Date())
  ) {
    const completo =
      await buscarPagamentoPorIdInterno(existente.id);

    if (completo) {
      return serializarPagamento(completo);
    }
  }

  if (existente?.status === "APROVADO") {
    const completo =
      await buscarPagamentoPorIdInterno(existente.id);

    if (completo) {
      return serializarPagamento(completo);
    }
  }

  const valor = Number(
    (
      Number(reserva.presente.valorUnitario.toString()) *
      reserva.quantidade
    ).toFixed(2),
  );

  const pagamentoId = existente?.id ?? (
    await prisma.pagamento.create({
      data: {
        reservaId: reserva.id,
        valor,
        moeda: "BRL",
        provedor: "MERCADO_PAGO",
        metodo: "PIX",
        status: "PENDENTE",
      },
      select: { id: true },
    })
  ).id;

  const interno =
    await prisma.pagamento.findUniqueOrThrow({
      where: { id: pagamentoId },
      select: {
        id: true,
        idempotenciaChave: true,
      },
    });

  const agora = new Date();
  const expiraPixEm = somarMinutos(
    agora,
    PIX_DURACAO_MINUTOS,
  );

  const remoto = await criarPixMercadoPago({
    valor,
    descricao: `Presente: ${reserva.presente.nome}`,
    referenciaExterna: interno.id,
    idempotenciaChave: interno.idempotenciaChave,
    email: dados.email,
    cpf: dados.documento,
    expiraEm: expiraPixEm,
  });

  const transactionData =
    remoto.point_of_interaction?.transaction_data;

  if (
    !transactionData?.qr_code ||
    !transactionData.qr_code_base64
  ) {
    throw new ErroAplicacao(
      "O pagamento foi criado, mas o Mercado Pago não retornou os dados do Pix.",
      502,
      "MERCADO_PAGO_PIX_INCOMPLETO",
    );
  }

  const expiraEm = remoto.date_of_expiration
    ? new Date(remoto.date_of_expiration)
    : expiraPixEm;

  const reservaExpiraEm = somarMinutos(
    expiraEm,
    MARGEM_RESERVA_APOS_PIX_MINUTOS,
  );

  await prisma.$transaction([
    prisma.pagamento.update({
      where: { id: interno.id },
      data: {
        status: mapearStatusMercadoPago(remoto.status),
        provedor: "MERCADO_PAGO",
        metodo: "PIX",
        referenciaExterna: String(remoto.id),
        codigoPixCopiaCola: transactionData.qr_code,
        qrCodePix: transactionData.qr_code_base64,
        urlCheckout: transactionData.ticket_url ?? null,
        expiraEm,
      },
    }),
    prisma.reservaPresente.update({
      where: { id: reserva.id },
      data: {
        emailResponsavel: dados.email,
        expiraEm: reservaExpiraEm,
      },
    }),
  ]);

  const atualizado =
    await buscarPagamentoPorIdInterno(interno.id);

  if (!atualizado) {
    throw new Error(
      "Pagamento criado, mas não foi possível relê-lo.",
    );
  }

  return serializarPagamento(atualizado);
}

export async function buscarPagamentoAtualReserva(
  tokenReserva: string,
) {
  await expirarReservasVencidas();
  await expirarPagamentosVencidos();

  const pagamento =
    await prisma.pagamento.findFirst({
      where: {
        reserva: { token: tokenReserva },
      },
      orderBy: { criadoEm: "desc" },
      select: selecaoPagamento,
    });

  if (!pagamento) {
    return null;
  }

  if (
    pagamento.provedor === "MERCADO_PAGO" &&
    pagamento.referenciaExterna &&
    (pagamento.status === "PENDENTE" ||
      pagamento.status === "PROCESSANDO" ||
      pagamento.status === "EXPIRADO")
  ) {
    const remoto = await buscarPagamentoMercadoPago(
      pagamento.referenciaExterna,
    );

    const sincronizado =
      await aplicarEstadoMercadoPago(remoto);

    if (sincronizado) {
      return serializarPagamento(sincronizado);
    }
  }

  return serializarPagamento(pagamento);
}

export async function processarPagamentoMercadoPago(
  pagamentoMercadoPagoId: string,
) {
  const remoto = await buscarPagamentoMercadoPago(
    pagamentoMercadoPagoId,
  );

  const atualizado =
    await aplicarEstadoMercadoPago(remoto);

  return atualizado
    ? serializarPagamento(atualizado)
    : null;
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
      orderBy: { criadoEm: "desc" },
      select: selecaoPagamento,
    });

  return pagamentos.map(serializarPagamento);
}

export async function confirmarPagamentoManual(
  pagamentoId: string,
) {
  await expirarReservasVencidas();
  await expirarPagamentosVencidos();

  const existente =
    await buscarPagamentoPorIdInterno(pagamentoId);

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
        status: { in: ["PENDENTE", "PROCESSANDO"] },
      },
      data: {
        status: "CANCELADO",
        canceladoEm: agora,
      },
    });

    await tx.reservaPresente.update({
      where: { id: existente.reserva.id },
      data: {
        status: "CONCLUIDA",
        concluidoEm: agora,
      },
    });
  });

  const atualizado =
    await buscarPagamentoPorIdInterno(pagamentoId);

  if (!atualizado) {
    throw new Error(
      "Pagamento confirmado, mas não foi possível relê-lo.",
    );
  }

  return serializarPagamento(atualizado);
}
