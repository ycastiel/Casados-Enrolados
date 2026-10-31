import { prisma } from "@casados/database";

import { ErroAplicacao } from "../helpers/erros/ErrosIndex.js";
import { expirarReservasVencidas } from "../presentes/Reserva.js";

import type {
  CriarPagamentoPixBody,
} from "../../validators/pagamentos/PagamentoValidator.js";

import {
  buscarOrderMercadoPago,
  criarPixMercadoPago,
  type OrderMercadoPago,
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

function mapearStatusOrderMercadoPago(
  status: string,
  statusDetail?: string | null,
) {
  switch (status) {
    case "processed":
      return statusDetail === "partially_refunded"
        ? "ESTORNADO" as const
        : "APROVADO" as const;

    case "processing":
      return "PROCESSANDO" as const;

    case "action_required":
    case "created":
      return "PENDENTE" as const;

    case "canceled":
      return statusDetail === "expired"
        ? "EXPIRADO" as const
        : "CANCELADO" as const;

    case "failed":
      return statusDetail === "expired"
        ? "EXPIRADO" as const
        : "RECUSADO" as const;

    case "refunded":
    case "charged_back":
      return "ESTORNADO" as const;

    default:
      return "PENDENTE" as const;
  }
}

function obterTransacaoPix(
  order: OrderMercadoPago,
) {
  return order.transactions?.payments?.find(
    (pagamento) =>
      pagamento.payment_method?.id === "pix",
  ) ?? order.transactions?.payments?.[0] ?? null;
}

async function aplicarEstadoMercadoPago(
  remoto: OrderMercadoPago,
) {
  const idInterno =
    remoto.external_reference ?? undefined;

  const pagamento = idInterno
    ? await buscarPagamentoPorIdInterno(idInterno)
    : await prisma.pagamento.findUnique({
        where: {
          referenciaExterna: remoto.id,
        },
        select: selecaoPagamento,
      });

  if (!pagamento) {
    return null;
  }

  if (remoto.total_amount) {
    const valorRemoto = Number(remoto.total_amount);

    if (
      Number.isFinite(valorRemoto) &&
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
  }

  const status = mapearStatusOrderMercadoPago(
    remoto.status,
    remoto.status_detail,
  );

  const transacao = obterTransacaoPix(remoto);
  const agora = new Date();

  const aprovadoEm =
    status === "APROVADO"
      ? remoto.last_updated_date
        ? new Date(remoto.last_updated_date)
        : agora
      : null;

  await prisma.$transaction(async (tx) => {
    await tx.pagamento.update({
      where: { id: pagamento.id },
      data: {
        status,
        provedor: "MERCADO_PAGO",
        metodo: "PIX",
        referenciaExterna: remoto.id,
        urlCheckout:
          transacao?.payment_method?.ticket_url ??
          pagamento.urlCheckout,
        codigoPixCopiaCola:
          transacao?.payment_method?.qr_code ??
          pagamento.codigoPixCopiaCola,
        qrCodePix:
          transacao?.payment_method?.qr_code_base64 ??
          pagamento.qrCodePix,
        aprovadoEm,
        canceladoEm:
          status === "CANCELADO" || status === "EXPIRADO"
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
  });

  const transacao = obterTransacaoPix(remoto);
  const metodo = transacao?.payment_method;

  if (!metodo?.qr_code && !metodo?.ticket_url) {
    throw new ErroAplicacao(
      "A Order foi criada, mas o Mercado Pago não retornou os dados necessários do Pix.",
      502,
      "MERCADO_PAGO_PIX_INCOMPLETO",
    );
  }

  const reservaExpiraEm = somarMinutos(
    expiraPixEm,
    MARGEM_RESERVA_APOS_PIX_MINUTOS,
  );

  await prisma.$transaction([
    prisma.pagamento.update({
      where: { id: interno.id },
      data: {
        status: mapearStatusOrderMercadoPago(
          remoto.status,
          remoto.status_detail,
        ),
        provedor: "MERCADO_PAGO",
        metodo: "PIX",
        referenciaExterna: remoto.id,
        codigoPixCopiaCola: metodo.qr_code ?? null,
        qrCodePix: metodo.qr_code_base64 ?? null,
        urlCheckout: metodo.ticket_url ?? null,
        expiraEm: expiraPixEm,
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
  const pagamento =
    await prisma.pagamento.findFirst({
      where: {
        reserva: { token: tokenReserva },
      },
      orderBy: { criadoEm: "desc" },
      select: selecaoPagamento,
    });

  if (!pagamento) {
    await expirarReservasVencidas();
    return null;
  }

  if (
    pagamento.provedor === "MERCADO_PAGO" &&
    pagamento.referenciaExterna &&
    (pagamento.status === "PENDENTE" ||
      pagamento.status === "PROCESSANDO" ||
      pagamento.status === "EXPIRADO")
  ) {
    const remoto = await buscarOrderMercadoPago(
      pagamento.referenciaExterna,
    );

    const sincronizado =
      await aplicarEstadoMercadoPago(remoto);

    if (sincronizado) {
      await expirarReservasVencidas();
      await expirarPagamentosVencidos();
      return serializarPagamento(sincronizado);
    }
  }

  await expirarReservasVencidas();
  await expirarPagamentosVencidos();

  const atualizado =
    await buscarPagamentoPorIdInterno(pagamento.id);

  return atualizado
    ? serializarPagamento(atualizado)
    : null;
}

export async function processarOrderMercadoPago(
  orderId: string,
) {
  const remoto = await buscarOrderMercadoPago(orderId);

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
