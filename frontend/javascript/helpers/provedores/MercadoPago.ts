import { loadMercadoPago } from "@mercadopago/sdk-js";

type MercadoPagoInstancia = unknown;
type MercadoPagoConstrutor = new (
  publicKey: string,
) => MercadoPagoInstancia;

type JanelaMercadoPago = Window & {
  MercadoPago?: MercadoPagoConstrutor;
};

let inicializacao: Promise<MercadoPagoInstancia> | null = null;

export function inicializarMercadoPago() {
  if (inicializacao) {
    return inicializacao;
  }

  inicializacao = (async () => {
    const publicKey =
      import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY?.trim();

    if (!publicKey) {
      throw new Error(
        "VITE_MERCADO_PAGO_PUBLIC_KEY não foi configurada no frontend.",
      );
    }

    await loadMercadoPago();

    const MercadoPago =
      (window as JanelaMercadoPago).MercadoPago;

    if (!MercadoPago) {
      throw new Error(
        "O SDK MercadoPago.js não ficou disponível após o carregamento.",
      );
    }

    return new MercadoPago(publicKey);
  })();

  return inicializacao;
}
