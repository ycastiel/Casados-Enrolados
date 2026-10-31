import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { ambiente } from "../../../configs/Ambiente.js";
import { ErroAplicacao } from "../../helpers/erros/ErrosIndex.js";

const BASE_URL = "https://api.mercadopago.com";

type StatusMercadoPago =
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | string;

export type PagamentoMercadoPago = {
  id: number;
  status: StatusMercadoPago;
  status_detail?: string | null;
  external_reference?: string | null;
  transaction_amount?: number | null;
  date_of_expiration?: string | null;
  date_approved?: string | null;
  point_of_interaction?: {
    type?: string | null;
    transaction_data?: {
      qr_code?: string | null;
      qr_code_base64?: string | null;
      ticket_url?: string | null;
    } | null;
  } | null;
};

type CriarPixDados = {
  valor: number;
  descricao: string;
  referenciaExterna: string;
  idempotenciaChave: string;
  email: string;
  cpf: string;
  expiraEm: Date;
};

function accessToken() {
  if (!ambiente.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new ErroAplicacao(
      "O Mercado Pago ainda não foi configurado no servidor.",
      503,
      "MERCADO_PAGO_NAO_CONFIGURADO",
    );
  }

  return ambiente.MERCADO_PAGO_ACCESS_TOKEN;
}

async function lerJson(
  resposta: Response,
): Promise<unknown> {
  const texto = await resposta.text();

  if (!texto) {
    return null;
  }

  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return { mensagem: texto };
  }
}

async function requisicaoMercadoPago<T>(
  caminho: string,
  init?: RequestInit,
): Promise<T> {
  const resposta = await fetch(
    `${BASE_URL}${caminho}`,
    {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken()}`,
        ...(init?.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...init?.headers,
      },
    },
  );

  const corpo = await lerJson(resposta);

  if (!resposta.ok) {
    throw new ErroAplicacao(
      "O Mercado Pago não conseguiu processar esta operação agora.",
      502,
      "MERCADO_PAGO_ERRO",
      {
        status: resposta.status,
        resposta: corpo,
      },
    );
  }

  return corpo as T;
}

export async function criarPixMercadoPago(
  dados: CriarPixDados,
) {
  return requisicaoMercadoPago<PagamentoMercadoPago>(
    "/v1/payments",
    {
      method: "POST",
      headers: {
        "X-Idempotency-Key": dados.idempotenciaChave,
      },
      body: JSON.stringify({
        transaction_amount: dados.valor,
        description: dados.descricao.slice(0, 150),
        payment_method_id: "pix",
        external_reference: dados.referenciaExterna,
        date_of_expiration: dados.expiraEm.toISOString(),
        payer: {
          email: dados.email,
          identification: {
            type: "CPF",
            number: dados.cpf,
          },
        },
      }),
    },
  );
}

export async function buscarPagamentoMercadoPago(
  pagamentoId: string,
) {
  return requisicaoMercadoPago<PagamentoMercadoPago>(
    `/v1/payments/${encodeURIComponent(pagamentoId)}`,
  );
}

export async function cancelarPagamentoMercadoPago(
  pagamentoId: string,
) {
  return requisicaoMercadoPago<PagamentoMercadoPago>(
    `/v1/payments/${encodeURIComponent(pagamentoId)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        status: "cancelled",
      }),
    },
  );
}

export function validarAssinaturaWebhookMercadoPago({
  xSignature,
  xRequestId,
  dataId,
}: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string | undefined;
}) {
  const secret =
    ambiente.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    if (ambiente.NODE_ENV === "production") {
      throw new ErroAplicacao(
        "A assinatura de Webhook do Mercado Pago não foi configurada.",
        503,
        "MERCADO_PAGO_WEBHOOK_NAO_CONFIGURADO",
      );
    }

    /*
     * Em desenvolvimento local o webhook normalmente nem é alcançável.
     * A consulta periódica de status continua funcionando sem esta chave.
     */
    return true;
  }

  if (!xSignature || !xRequestId || !dataId) {
    return false;
  }

  const partes = Object.fromEntries(
    xSignature
      .split(",")
      .map((parte) => parte.trim().split("=", 2))
      .filter(([chave, valor]) => Boolean(chave && valor)),
  );

  const ts = partes.ts;
  const assinaturaRecebida = partes.v1;

  if (!ts || !assinaturaRecebida) {
    return false;
  }

  const manifesto =
    `id:${dataId};` +
    `request-id:${xRequestId};` +
    `ts:${ts};`;

  const assinaturaCalculada = createHmac(
    "sha256",
    secret,
  )
    .update(manifesto)
    .digest("hex");

  const recebida = Buffer.from(
    assinaturaRecebida,
    "utf8",
  );
  const calculada = Buffer.from(
    assinaturaCalculada,
    "utf8",
  );

  return (
    recebida.length === calculada.length &&
    timingSafeEqual(recebida, calculada)
  );
}
