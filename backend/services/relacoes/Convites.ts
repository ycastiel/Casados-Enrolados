import { prisma } from "@casados/database";

import { ErroAplicacao } from "../helpers/erros/ErrosIndex.js";

import type {
  AtualizarConvidadoDados,
  AtualizarConviteDados,
  ConvidadoDados,
  CriarConviteDados,
} from "../../validators/relacoes/ConviteValidator.js";

const selecaoConvite = {
  id: true,
  nomeExibicao: true,
  token: true,
  mensagem: true,
  observacaoInterna: true,
  ativo: true,
  enviadoEm: true,
  expiraEm: true,
  criadoEm: true,
  atualizadoEm: true,

  convidados: {
    orderBy: {
      nome: "asc" as const,
    },

    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      restricaoAlimentar: true,
      observacao: true,
      criadoEm: true,
      atualizadoEm: true,

      confirmacoes: {
        orderBy: {
          evento: {
            inicioEm: "asc" as const,
          },
        },

        select: {
          id: true,
          status: true,
          observacao: true,
          respondidoEm: true,

          evento: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              inicioEm: true,
            },
          },
        },
      },
    },
  },
};

async function buscarCasamentoAtivo() {
  const casamento = await prisma.casamento.findFirst({
    where: {
      ativo: true,
    },

    select: {
      id: true,

      eventos: {
        where: {
          visivel: true,
          exigeConfirmacao: true,
        },

        select: {
          id: true,
        },
      },
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

export async function listarConvites() {
  const casamento = await buscarCasamentoAtivo();

  return prisma.convite.findMany({
    where: {
      casamentoId: casamento.id,
      ativo: true,
    },

    orderBy: {
      nomeExibicao: "asc",
    },

    select: selecaoConvite,
  });
}

export async function criarConvite(
  dados: CriarConviteDados,
) {
  const casamento = await buscarCasamentoAtivo();

  return prisma.convite.create({
    data: {
      casamentoId: casamento.id,
      nomeExibicao: dados.nomeExibicao,
      mensagem: dados.mensagem,
      observacaoInterna:
        dados.observacaoInterna,

      convidados: {
        create: dados.convidados.map(
          (convidado) => ({
            nome: convidado.nome,
            email: convidado.email,
            telefone: convidado.telefone,
            restricaoAlimentar:
              convidado.restricaoAlimentar,
            observacao: convidado.observacao,

            confirmacoes: {
              create: casamento.eventos.map(
                (evento) => ({
                  eventoId: evento.id,
                }),
              ),
            },
          }),
        ),
      },
    },

    select: selecaoConvite,
  });
}

export async function atualizarConvite(
  id: string,
  dados: AtualizarConviteDados,
) {
  const casamento = await buscarCasamentoAtivo();

  const convite = await prisma.convite.findFirst({
    where: {
      id,
      casamentoId: casamento.id,
    },

    select: {
      id: true,
    },
  });

  if (!convite) {
    throw ErroAplicacao.naoEncontrado(
      "Convite não encontrado.",
      "CONVITE_NAO_ENCONTRADO",
    );
  }

  return prisma.convite.update({
    where: {
      id,
    },

    data: {
      nomeExibicao: dados.nomeExibicao,
      mensagem: dados.mensagem,
      observacaoInterna:
        dados.observacaoInterna,
      ativo: dados.ativo,
    },

    select: selecaoConvite,
  });
}

export async function desativarConvite(
  id: string,
) {
  return atualizarConvite(id, {
    ativo: false,
  });
}

export async function adicionarConvidado(
  conviteId: string,
  dados: ConvidadoDados,
) {
  const casamento = await buscarCasamentoAtivo();

  const convite = await prisma.convite.findFirst({
    where: {
      id: conviteId,
      casamentoId: casamento.id,
      ativo: true,
    },

    select: {
      id: true,
    },
  });

  if (!convite) {
    throw ErroAplicacao.naoEncontrado(
      "Convite não encontrado.",
      "CONVITE_NAO_ENCONTRADO",
    );
  }

  return prisma.convidado.create({
    data: {
      conviteId,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      restricaoAlimentar:
        dados.restricaoAlimentar,
      observacao: dados.observacao,

      confirmacoes: {
        create: casamento.eventos.map(
          (evento) => ({
            eventoId: evento.id,
          }),
        ),
      },
    },

    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      restricaoAlimentar: true,
      observacao: true,
      criadoEm: true,
      atualizadoEm: true,

      confirmacoes: {
        select: {
          id: true,
          status: true,
          observacao: true,
          respondidoEm: true,

          evento: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              inicioEm: true,
            },
          },
        },
      },
    },
  });
}

export async function atualizarConvidado(
  id: string,
  dados: AtualizarConvidadoDados,
) {
  const casamento = await buscarCasamentoAtivo();

  const convidado =
    await prisma.convidado.findFirst({
      where: {
        id,

        convite: {
          casamentoId: casamento.id,
          ativo: true,
        },
      },

      select: {
        id: true,
      },
    });

  if (!convidado) {
    throw ErroAplicacao.naoEncontrado(
      "Convidado não encontrado.",
      "CONVIDADO_NAO_ENCONTRADO",
    );
  }

  return prisma.convidado.update({
    where: {
      id,
    },

    data: {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      restricaoAlimentar:
        dados.restricaoAlimentar,
      observacao: dados.observacao,
    },

    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      restricaoAlimentar: true,
      observacao: true,
      criadoEm: true,
      atualizadoEm: true,

      confirmacoes: {
        select: {
          id: true,
          status: true,
          observacao: true,
          respondidoEm: true,

          evento: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              inicioEm: true,
            },
          },
        },
      },
    },
  });
}

export async function removerConvidado(
  id: string,
) {
  const casamento = await buscarCasamentoAtivo();

  const convidado =
    await prisma.convidado.findFirst({
      where: {
        id,

        convite: {
          casamentoId: casamento.id,
          ativo: true,
        },
      },

      select: {
        id: true,
      },
    });

  if (!convidado) {
    throw ErroAplicacao.naoEncontrado(
      "Convidado não encontrado.",
      "CONVIDADO_NAO_ENCONTRADO",
    );
  }

  await prisma.convidado.delete({
    where: {
      id,
    },
  });
}
