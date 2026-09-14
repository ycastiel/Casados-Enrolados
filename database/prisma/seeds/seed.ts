import { prisma } from "../../client/Client.js";

const IDS = {
  casamento: "00000000-0000-4000-8000-000000000001",

  cerimonia: "00000000-0000-4000-8000-000000000101",
  recepcao: "00000000-0000-4000-8000-000000000102",

  conviteFamiliaTeste: "00000000-0000-4000-8000-000000000201",

  convidadoCarlos: "00000000-0000-4000-8000-000000000301",
  convidadaAna: "00000000-0000-4000-8000-000000000302",

  presenteAirFryer: "00000000-0000-4000-8000-000000000401",
  presenteLuaDeMel: "00000000-0000-4000-8000-000000000402",
} as const;

async function main() {
  console.log("🌱 Iniciando seed...");

  // --------------------------------------------------
  // Casamento
  // --------------------------------------------------

  await prisma.casamento.upsert({
    where: {
      slug: "casamento-dev",
    },

    update: {},

    create: {
      id: IDS.casamento,

      nomePessoa1: "Noiva Exemplo",
      nomePessoa2: "Pessoa Parceira",

      titulo: "Casados & Enrolados",
      descricao: "Dados de desenvolvimento do Casados & Enrolados.",

      slug: "casamento-dev",

      dataCasamento: new Date("2030-09-01"),
      fusoHorario: "America/Sao_Paulo",

      ativo: true,
    },
  });

  // --------------------------------------------------
  // Eventos
  // --------------------------------------------------

  await prisma.evento.upsert({
    where: {
      id: IDS.cerimonia,
    },

    update: {},

    create: {
      id: IDS.cerimonia,
      casamentoId: IDS.casamento,

      nome: "Cerimônia",
      descricao: "Cerimônia de casamento.",

      tipo: "CERIMONIA",

      inicioEm: new Date("2030-09-01T16:00:00-03:00"),
      fimEm: new Date("2030-09-01T17:00:00-03:00"),

      local: "Local de exemplo",
      endereco: "Endereço de exemplo",

      exigeConfirmacao: true,
      visivel: true,

      ordem: 1,
    },
  });

  await prisma.evento.upsert({
    where: {
      id: IDS.recepcao,
    },

    update: {},

    create: {
      id: IDS.recepcao,
      casamentoId: IDS.casamento,

      nome: "Recepção",
      descricao: "Recepção após a cerimônia.",

      tipo: "RECEPCAO",

      inicioEm: new Date("2030-09-01T18:00:00-03:00"),

      local: "Salão de exemplo",
      endereco: "Outro endereço de exemplo",

      exigeConfirmacao: true,
      visivel: true,

      ordem: 2,
    },
  });

  // --------------------------------------------------
  // Convite
  // --------------------------------------------------

  await prisma.convite.upsert({
    where: {
      id: IDS.conviteFamiliaTeste,
    },

    update: {},

    create: {
      id: IDS.conviteFamiliaTeste,
      casamentoId: IDS.casamento,

      nomeExibicao: "Família Teste",

      // Intencionalmente legível porque é somente desenvolvimento.
      token: "convite-dev-familia-teste",

      ativo: true,
    },
  });

  // --------------------------------------------------
  // Convidados
  // --------------------------------------------------

  await prisma.convidado.upsert({
    where: {
      id: IDS.convidadoCarlos,
    },

    update: {},

    create: {
      id: IDS.convidadoCarlos,
      conviteId: IDS.conviteFamiliaTeste,

      nome: "Carlos Teste",
      email: "carlos@example.com",
    },
  });

  await prisma.convidado.upsert({
    where: {
      id: IDS.convidadaAna,
    },

    update: {},

    create: {
      id: IDS.convidadaAna,
      conviteId: IDS.conviteFamiliaTeste,

      nome: "Ana Teste",
      email: "ana@example.com",

      restricaoAlimentar: "Vegetariana",
    },
  });

  // --------------------------------------------------
  // RSVP
  // --------------------------------------------------

  const confirmacoes = [
    {
      convidadoId: IDS.convidadoCarlos,
      eventoId: IDS.cerimonia,
    },
    {
      convidadoId: IDS.convidadoCarlos,
      eventoId: IDS.recepcao,
    },
    {
      convidadoId: IDS.convidadaAna,
      eventoId: IDS.cerimonia,
    },
    {
      convidadoId: IDS.convidadaAna,
      eventoId: IDS.recepcao,
    },
  ];

  for (const confirmacao of confirmacoes) {
    await prisma.confirmacaoPresenca.upsert({
      where: {
        convidadoId_eventoId: {
          convidadoId: confirmacao.convidadoId,
          eventoId: confirmacao.eventoId,
        },
      },

      update: {},

      create: {
        ...confirmacao,
        status: "PENDENTE",
      },
    });
  }

  // --------------------------------------------------
  // Presentes
  // --------------------------------------------------

  await prisma.presente.upsert({
    where: {
      id: IDS.presenteAirFryer,
    },

    update: {},

    create: {
      id: IDS.presenteAirFryer,
      casamentoId: IDS.casamento,

      nome: "Air Fryer",
      descricao: "Presente físico de exemplo.",

      tipo: "PRODUTO",
      valorUnitario: "399.90",

      quantidadeTotal: 1,

      ativo: true,
      ordem: 1,
    },
  });

  await prisma.presente.upsert({
    where: {
      id: IDS.presenteLuaDeMel,
    },

    update: {},

    create: {
      id: IDS.presenteLuaDeMel,
      casamentoId: IDS.casamento,

      nome: "Cota da lua de mel",
      descricao: "Cotas para ajudar na viagem dos noivos.",

      tipo: "COTA",
      valorUnitario: "100.00",

      quantidadeTotal: 20,

      ativo: true,
      ordem: 2,
    },
  });

  console.log("✅ Seed concluído!");

  const [
    quantidadeCasamentos,
    quantidadeEventos,
    quantidadeConvites,
    quantidadeConvidados,
    quantidadePresentes,
  ] = await Promise.all([
    prisma.casamento.count(),
    prisma.evento.count(),
    prisma.convite.count(),
    prisma.convidado.count(),
    prisma.presente.count(),
  ]);

  console.log(`
📊 Banco preparado:
   Casamentos:  ${quantidadeCasamentos}
   Eventos:     ${quantidadeEventos}
   Convites:    ${quantidadeConvites}
   Convidados:  ${quantidadeConvidados}
   Presentes:   ${quantidadePresentes}
  `);
}

main()
  .catch((erro) => {
    console.error("❌ Erro durante o seed:");
    console.error(erro);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });