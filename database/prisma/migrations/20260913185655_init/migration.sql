-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('PROPRIETARIO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('CERIMONIA', 'RECEPCAO', 'FESTA', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusConfirmacao" AS ENUM ('PENDENTE', 'CONFIRMADO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "TipoPresente" AS ENUM ('PRODUTO', 'COTA');

-- CreateEnum
CREATE TYPE "StatusReservaPresente" AS ENUM ('RESERVADA', 'CONCLUIDA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "Casamento" (
    "id" TEXT NOT NULL,
    "nomePessoa1" TEXT NOT NULL,
    "nomePessoa2" TEXT NOT NULL,
    "titulo" TEXT,
    "descricao" TEXT,
    "slug" TEXT NOT NULL,
    "dataCasamento" TIMESTAMP(3) NOT NULL,
    "fusoHorario" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Casamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "casamentoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'ADMINISTRADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcessoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convite" (
    "id" TEXT NOT NULL,
    "casamentoId" TEXT NOT NULL,
    "nomeExibicao" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "mensagem" TEXT,
    "observacaoInterna" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "enviadoEm" TIMESTAMP(3),
    "expiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convidado" (
    "id" TEXT NOT NULL,
    "conviteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "restricaoAlimentar" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convidado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "casamentoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'OUTRO',
    "inicioEm" TIMESTAMP(3) NOT NULL,
    "fimEm" TIMESTAMP(3),
    "local" TEXT,
    "endereco" TEXT,
    "urlMapa" TEXT,
    "exigeConfirmacao" BOOLEAN NOT NULL DEFAULT true,
    "visivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmacaoPresenca" (
    "id" TEXT NOT NULL,
    "convidadoId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "status" "StatusConfirmacao" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "respondidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfirmacaoPresenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presente" (
    "id" TEXT NOT NULL,
    "casamentoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoPresente" NOT NULL DEFAULT 'PRODUTO',
    "valorUnitario" DECIMAL(10,2),
    "imagemUrl" TEXT,
    "urlExterna" TEXT,
    "quantidadeTotal" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaPresente" (
    "id" TEXT NOT NULL,
    "presenteId" TEXT NOT NULL,
    "conviteId" TEXT,
    "nomeResponsavel" TEXT NOT NULL,
    "emailResponsavel" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusReservaPresente" NOT NULL DEFAULT 'RESERVADA',
    "reservadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" TIMESTAMP(3),
    "concluidoEm" TIMESTAMP(3),
    "canceladoEm" TIMESTAMP(3),

    CONSTRAINT "ReservaPresente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Casamento_slug_key" ON "Casamento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_casamentoId_idx" ON "Usuario"("casamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Convite_token_key" ON "Convite"("token");

-- CreateIndex
CREATE INDEX "Convite_casamentoId_idx" ON "Convite"("casamentoId");

-- CreateIndex
CREATE INDEX "Convidado_conviteId_idx" ON "Convidado"("conviteId");

-- CreateIndex
CREATE INDEX "Evento_casamentoId_idx" ON "Evento"("casamentoId");

-- CreateIndex
CREATE INDEX "ConfirmacaoPresenca_convidadoId_idx" ON "ConfirmacaoPresenca"("convidadoId");

-- CreateIndex
CREATE INDEX "ConfirmacaoPresenca_eventoId_idx" ON "ConfirmacaoPresenca"("eventoId");

-- CreateIndex
CREATE INDEX "ConfirmacaoPresenca_status_idx" ON "ConfirmacaoPresenca"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmacaoPresenca_convidadoId_eventoId_key" ON "ConfirmacaoPresenca"("convidadoId", "eventoId");

-- CreateIndex
CREATE INDEX "Presente_casamentoId_idx" ON "Presente"("casamentoId");

-- CreateIndex
CREATE INDEX "ReservaPresente_presenteId_idx" ON "ReservaPresente"("presenteId");

-- CreateIndex
CREATE INDEX "ReservaPresente_conviteId_idx" ON "ReservaPresente"("conviteId");

-- CreateIndex
CREATE INDEX "ReservaPresente_status_idx" ON "ReservaPresente"("status");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_casamentoId_fkey" FOREIGN KEY ("casamentoId") REFERENCES "Casamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_casamentoId_fkey" FOREIGN KEY ("casamentoId") REFERENCES "Casamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convidado" ADD CONSTRAINT "Convidado_conviteId_fkey" FOREIGN KEY ("conviteId") REFERENCES "Convite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_casamentoId_fkey" FOREIGN KEY ("casamentoId") REFERENCES "Casamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmacaoPresenca" ADD CONSTRAINT "ConfirmacaoPresenca_convidadoId_fkey" FOREIGN KEY ("convidadoId") REFERENCES "Convidado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmacaoPresenca" ADD CONSTRAINT "ConfirmacaoPresenca_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presente" ADD CONSTRAINT "Presente_casamentoId_fkey" FOREIGN KEY ("casamentoId") REFERENCES "Casamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaPresente" ADD CONSTRAINT "ReservaPresente_presenteId_fkey" FOREIGN KEY ("presenteId") REFERENCES "Presente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaPresente" ADD CONSTRAINT "ReservaPresente_conviteId_fkey" FOREIGN KEY ("conviteId") REFERENCES "Convite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
