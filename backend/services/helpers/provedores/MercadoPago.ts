import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { ambiente } from "../../../configs/Ambiente.js";
import { ErroAplicacao } from "../../helpers/erros/ErrosIndex.js";

const BASE_URL = "https://api.mercadopago.com";

export type StatusOrderMercadoPago =
  | "created"
  | "processing"
  | "action_required"
  | "processed"
  | "canceled"
  | "failed"
  | "refunded"
  | "charged_back"
  | string;

export type OrderMercadoPago = {
  id: string;
  type?: string | null;
  processing_mode?: string | null;
  external_reference?: string | null;
  total_amount?: string | null;
  status: StatusOrderMercadoPago;
  status_detail?: string | null;
  created_date?: string | null;
  last_updated_date?: string | null;
  transactions?: {
    payments?: Array<{
      id?: string | null;
      amount?: string | null;
      status?: string | null;
      status_detail?: string | null;
      payment_method?: {
        id?: string | null;
        type?: string | null;
        ticket_url?: string | null;
        qr_code?: string | null;
        qr_code_base64?: string | null;
      } | null;
    }> | null;
  } | null;
};

type CriarPixDados = {
  valor: number;
  descricao: string;
  referenciaExterna: string;
  idempotenciaChave: string;
  email: string;
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
  const valor = dados.valor.toFixed(2);

  return requisicaoMercadoPago<OrderMercadoPago>(
    "/v1/orders",
    {
      method: "POST",
      headers: {
        "X-Idempotency-Key": dados.idempotenciaChave,
      },
      body: JSON.stringify({
        type: "online",
        processing_mode: "automatic",
        total_amount: valor,
        external_reference: dados.referenciaExterna,
        description: dados.descricao.slice(0, 150),
        payer: {
          email: dados.email,
          ...(ambiente.NODE_ENV !== "production" &&
            ambiente.MERCADO_PAGO_PIX_TESTE_APROVAR_AUTOMATICAMENTE
            ? { first_name: "APRO" }
            : {}),
        },
        transactions: {
          payments: [
            {
              amount: valor,
              payment_method: {
                id: "pix",
                type: "bank_transfer",
              },
              expiration_time: "PT31M",
            },
          ],
        },
      }),
    },
  );
}

export async function buscarOrderMercadoPago(
  orderId: string,
) {
  return requisicaoMercadoPago<OrderMercadoPago>(
    `/v1/orders/${encodeURIComponent(orderId)}`,
  );
}

export async function cancelarOrderMercadoPago(
  orderId: string,
) {
  return requisicaoMercadoPago<OrderMercadoPago>(
    `/v1/orders/${encodeURIComponent(orderId)}/cancel`,
    {
      method: "POST",
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
