-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PROCESSANDO', 'APROVADO', 'RECUSADO', 'CANCELADO', 'ESTORNADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "ProvedorPagamento" AS ENUM ('MANUAL', 'MERCADO_PAGO', 'PAGARME');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('PIX', 'CARTAO', 'BOLETO', 'OUTRO');

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "provedor" "ProvedorPagamento" NOT NULL DEFAULT 'MANUAL',
    "metodo" "MetodoPagamento",
    "valor" DECIMAL(10,2) NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "idempotenciaChave" TEXT NOT NULL,
    "referenciaExterna" TEXT,
    "urlCheckout" TEXT,
    "codigoPixCopiaCola" TEXT,
    "qrCodePix" TEXT,
    "expiraEm" TIMESTAMP(3),
    "aprovadoEm" TIMESTAMP(3),
    "canceladoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_idempotenciaChave_key" ON "Pagamento"("idempotenciaChave");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_referenciaExterna_key" ON "Pagamento"("referenciaExterna");

-- CreateIndex
CREATE INDEX "Pagamento_reservaId_idx" ON "Pagamento"("reservaId");

-- CreateIndex
CREATE INDEX "Pagamento_status_idx" ON "Pagamento"("status");

-- CreateIndex
CREATE INDEX "Pagamento_provedor_idx" ON "Pagamento"("provedor");

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "ReservaPresente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
