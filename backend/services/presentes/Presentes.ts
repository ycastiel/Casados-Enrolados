import { prisma } from "@casados/database";

import { ErroAplicacao } from "../helpers/erros/ErrosIndex.js";

import {
  expirarReservasVencidas,
} from "./Reserva.js";

import type {
  AtualizarPresenteDados,
  CriarPresenteDados,
} from "../../validators/presentes/PresenteValidator.js";

const selecaoPresenteAdmin = {
  id: true,
  casamentoId: true,
  nome: true,
  descricao: true,
  tipo: true,
  valorUnitario: true,
  imagemUrl: true,
  urlExterna: true,
  quantidadeTotal: true,
  ativo: true,
  ordem: true,
  criadoEm: true,
  atualizadoEm: true,

  reservas: {
    orderBy: {
      reservadoEm: "desc" as const,
    },

    select: {
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
    },
  },
};

type PresenteSelecionado = Awaited<
  ReturnType<typeof buscarPresenteAdminPorIdInterno>
>;

function normalizarTexto(
  valor: string | null | undefined,
) {
  if (valor === undefined) {
    return undefined;
  }

  const texto = valor?.trim() ?? "";

  return texto.length > 0
    ? texto
    : null;
}

async function buscarCasamentoAtivo() {
  const casamento =
    await prisma.casamento.findFirst({
      where: {
        ativo: true,
      },

      select: {
        id: true,
      },
    });

  if (!casamento) {
    throw ErroAplicacao.naoEncontrado(
      "Nenhum casamento ativo foi encontrado.",
      "CASAMENTO_NAO_ENCONTRADO",
    );
  }

  return casamento;
}

async function buscarPresenteAdminPorIdInterno(
  casamentoId: string,
  presenteId: string,
) {
  return prisma.presente.findFirst({
    where: {
      id: presenteId,
      casamentoId,
    },

    select: selecaoPresenteAdmin,
  });
}

function serializarPresenteAdmin(
  presente: NonNullable<PresenteSelecionado>,
) {
  const agora = new Date();

  const reservasAtivas =
    presente.reservas.filter(
      (reserva) =>
        reserva.status === "RESERVADA" &&
        (
          reserva.expiraEm === null ||
          reserva.expiraEm > agora
        ),
    );

  const reservasConcluidas =
    presente.reservas.filter(
      (reserva) =>
        reserva.status === "CONCLUIDA",
    );

  const quantidadeReservada =
    reservasAtivas.reduce(
      (total, reserva) =>
        total + reserva.quantidade,
      0,
    );

  const quantidadeConcluida =
    reservasConcluidas.reduce(
      (total, reserva) =>
        total + reserva.quantidade,
      0,
    );

  const quantidadeComprometida =
    quantidadeReservada +
    quantidadeConcluida;

  return {
    id: presente.id,
    nome: presente.nome,
    descricao: presente.descricao,
    tipo: presente.tipo,

    valorUnitario:
      presente.valorUnitario
        ?.toString() ?? null,

    imagemUrl: presente.imagemUrl,
    urlExterna: presente.urlExterna,

    quantidadeTotal:
      presente.quantidadeTotal,

    quantidadeReservada,
    quantidadeConcluida,

    quantidadeDisponivel:
      Math.max(
        presente.quantidadeTotal -
          quantidadeComprometida,
        0,
      ),

    ativo: presente.ativo,
    ordem: presente.ordem,
    criadoEm: presente.criadoEm,
    atualizadoEm: presente.atualizadoEm,

    reservasAtivas,
  };
}

export async function listarPresentesAdmin() {
  await expirarReservasVencidas();

  const casamento =
    await buscarCasamentoAtivo();

  const presentes =
    await prisma.presente.findMany({
      where: {
        casamentoId: casamento.id,
      },

      orderBy: [
        {
          ordem: "asc",
        },
        {
          nome: "asc",
        },
      ],

      select: selecaoPresenteAdmin,
    });

  return presentes.map(
    serializarPresenteAdmin,
  );
}

export async function criarPresenteAdmin(
  dados: CriarPresenteDados,
) {
  const casamento =
    await buscarCasamentoAtivo();

  const presente =
    await prisma.presente.create({
      data: {
        casamentoId: casamento.id,
        nome: dados.nome,
        descricao:
          normalizarTexto(
            dados.descricao,
          ),
        tipo: dados.tipo,
        valorUnitario:
          dados.valorUnitario ?? null,
        imagemUrl:
          normalizarTexto(
            dados.imagemUrl,
          ),
        urlExterna:
          normalizarTexto(
            dados.urlExterna,
          ),
        quantidadeTotal:
          dados.quantidadeTotal,
        ativo: dados.ativo,
        ordem: dados.ordem,
      },

      select: selecaoPresenteAdmin,
    });

  return serializarPresenteAdmin(
    presente,
  );
}

export async function atualizarPresenteAdmin(
  id: string,
  dados: AtualizarPresenteDados,
) {
  await expirarReservasVencidas();

  const casamento =
    await buscarCasamentoAtivo();

  const existente =
    await buscarPresenteAdminPorIdInterno(
      casamento.id,
      id,
    );

  if (!existente) {
    throw ErroAplicacao.naoEncontrado(
      "Presente não encontrado.",
      "PRESENTE_NAO_ENCONTRADO",
    );
  }

  if (
    dados.quantidadeTotal !== undefined
  ) {
    const agora = new Date();

    const quantidadeComprometida =
      existente.reservas.reduce(
        (total, reserva) => {
          const ativa =
            reserva.status === "RESERVADA" &&
            (
              reserva.expiraEm === null ||
              reserva.expiraEm > agora
            );

          const concluida =
            reserva.status === "CONCLUIDA";

          return ativa || concluida
            ? total + reserva.quantidade
            : total;
        },
        0,
      );

    if (
      dados.quantidadeTotal <
      quantidadeComprometida
    ) {
      throw ErroAplicacao.conflito(
        `A quantidade total não pode ser menor que ${quantidadeComprometida}, pois essa quantidade já está reservada ou concluída.`,
        "QUANTIDADE_PRESENTE_INVALIDA",
      );
    }
  }

  const presente =
    await prisma.presente.update({
      where: {
        id,
      },

      data: {
        ...(dados.nome !== undefined
          ? {
              nome: dados.nome,
            }
          : {}),

        ...(dados.descricao !== undefined
          ? {
              descricao:
                normalizarTexto(
                  dados.descricao,
                ),
            }
          : {}),

        ...(dados.tipo !== undefined
          ? {
              tipo: dados.tipo,
            }
          : {}),

        ...(dados.valorUnitario !== undefined
          ? {
              valorUnitario:
                dados.valorUnitario,
            }
          : {}),

        ...(dados.imagemUrl !== undefined
          ? {
              imagemUrl:
                normalizarTexto(
                  dados.imagemUrl,
                ),
            }
          : {}),

        ...(dados.urlExterna !== undefined
          ? {
              urlExterna:
                normalizarTexto(
                  dados.urlExterna,
                ),
            }
          : {}),

        ...(dados.quantidadeTotal !== undefined
          ? {
              quantidadeTotal:
                dados.quantidadeTotal,
            }
          : {}),

        ...(dados.ativo !== undefined
          ? {
              ativo: dados.ativo,
            }
          : {}),

        ...(dados.ordem !== undefined
          ? {
              ordem: dados.ordem,
            }
          : {}),
      },

      select: selecaoPresenteAdmin,
    });

  return serializarPresenteAdmin(
    presente,
  );
}

export async function desativarPresenteAdmin(
  id: string,
) {
  return atualizarPresenteAdmin(
    id,
    {
      ativo: false,
    },
  );
}
