import { prisma } from "@casados/database";

export async function buscarCasamento() {
  const casamento = await prisma.casamento.findFirst({
    where: {
      ativo: true,
    },

    select: {
      id: true,
      slug: true,

      nomePessoa1: true,
      nomePessoa2: true,

      titulo: true,
      descricao: true,

      dataCasamento: true,
      fusoHorario: true,

      eventos: {
        where: {
          visivel: true,
        },

        orderBy: [
          {
            ordem: "asc",
          },
          {
            inicioEm: "asc",
          },
        ],

        select: {
          id: true,

          nome: true,
          descricao: true,

          tipo: true,

          inicioEm: true,
          fimEm: true,

          local: true,
          endereco: true,
          urlMapa: true,

          exigeConfirmacao: true,
        },
      },

      convites: {
        where: {
          ativo: true,
        },

        orderBy: {
          nomeExibicao: "asc",
        },

        select: {
          id: true,
          nomeExibicao: true,

          convidados: {
            orderBy: {
              nome: "asc",
            },

            select: {
              id: true,
              nome: true,

              restricaoAlimentar: true,

              confirmacoes: {
                select: {
                  status: true,
                  respondidoEm: true,

                  evento: {
                    select: {
                      id: true,
                      nome: true,
                    },
                  },
                },
              },
            },
          },
        },
      },

      presentes: {
        where: {
          ativo: true,
        },

        orderBy: {
          ordem: "asc",
        },

        select: {
          id: true,

          nome: true,
          descricao: true,

          tipo: true,

          valorUnitario: true,

          imagemUrl: true,
          urlExterna: true,

          quantidadeTotal: true,

          reservas: {
            where: {
              status: {
                in: ["RESERVADA", "CONCLUIDA"],
              },
            },

            select: {
              quantidade: true,
            },
          },
        },
      },
    },
  });

  if (!casamento) {
    return null;
  }

  const presentes = casamento.presentes.map((presente) => {
    const quantidadeReservada = presente.reservas.reduce(
      (total, reserva) => total + reserva.quantidade,
      0,
    );

    return {
      id: presente.id,

      nome: presente.nome,
      descricao: presente.descricao,

      tipo: presente.tipo,

      valorUnitario: presente.valorUnitario?.toString() ?? null,

      imagemUrl: presente.imagemUrl,
      urlExterna: presente.urlExterna,

      quantidadeTotal: presente.quantidadeTotal,
      quantidadeReservada,

      quantidadeDisponivel: Math.max(
        presente.quantidadeTotal - quantidadeReservada,
        0,
      ),
    };
  });

  return {
    casamento: {
      id: casamento.id,
      slug: casamento.slug,

      nomePessoa1: casamento.nomePessoa1,
      nomePessoa2: casamento.nomePessoa2,

      titulo: casamento.titulo,
      descricao: casamento.descricao,

      dataCasamento: casamento.dataCasamento,
      fusoHorario: casamento.fusoHorario,
    },

    eventos: casamento.eventos,

    convites: casamento.convites,

    presentes,
  };
}