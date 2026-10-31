import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  LinkTransicao,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

import {
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/molduras/Floral";

import { EstadoPagina } from "../../javascript/helpers/EstadoPagina";

import {
  buscarReserva,
  cancelarReserva,
  type ReservaPresente as ReservaPresenteTipo,
} from "../../javascript/paginas/presentes/ReservaPresente";

import {
  buscarPagamentoAtual,
  criarPagamentoPix,
  type PagamentoPix,
} from "../../javascript/helpers/provedores/PagamentoPix";

import {
  inicializarMercadoPago,
} from "../../javascript/helpers/provedores//MercadoPago";

import "../../css/paginas/presentes/reservas.css";

const moeda =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );

function formatarTempo(
  milissegundos: number,
) {
  const totalSegundos =
    Math.max(
      Math.floor(
        milissegundos /
          1000,
      ),
      0,
    );

  const minutos =
    Math.floor(
      totalSegundos / 60,
    );

  const segundos =
    totalSegundos % 60;

  return `${String(
    minutos,
  ).padStart(
    2,
    "0",
  )}:${String(
    segundos,
  ).padStart(
    2,
    "0",
  )}`;
}

function tituloStatus(
  status:
    ReservaPresenteTipo["status"],
) {
  switch (status) {
    case "RESERVADA":
      return "Seu presente está reservado 🌿";

    case "CONCLUIDA":
      return "Presente confirmado 💛";

    case "CANCELADA":
      return "Reserva cancelada";

    case "EXPIRADA":
      return "O tempo da reserva terminou";

    default:
      return "Reserva";
  }
}

export function ReservaPresente() {
  const { token } =
    useParams();

  const [
    reserva,
    setReserva,
  ] =
    useState<ReservaPresenteTipo | null>(
      null,
    );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    processando,
    setProcessando,
  ] = useState(false);

  const [
    pagamento,
    setPagamento,
  ] = useState<PagamentoPix | null>(null);

  const [
    gerandoPix,
    setGerandoPix,
  ] = useState(false);

  const [
    emailPagamento,
    setEmailPagamento,
  ] = useState("");

  const [
    codigoCopiado,
    setCodigoCopiado,
  ] = useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [
    agora,
    setAgora,
  ] = useState(
    Date.now(),
  );

  const carregar =
    useCallback(async () => {
      if (!token) {
        setErro(
          "Token da reserva ausente.",
        );
        setCarregando(false);
        return;
      }

      try {
        setErro(null);

        const resultado =
          await buscarReserva(
            token,
          );

        setReserva(
          resultado,
        );
      } catch (erroCapturado) {
        setErro(
          erroCapturado instanceof
            Error
            ? erroCapturado.message
            : "Não foi possível carregar a reserva.",
        );
      } finally {
        setCarregando(false);
      }
    }, [token]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    /*
     * Inicializa MercadoPago.js V2 com a Public Key de teste/produção.
     * O Pix atual é criado pelo backend via Orders API, mas deixamos
     * o frontend preparado conforme o fluxo oficial do Checkout Transparente
     * e para os próximos meios de pagamento (ex.: cartão).
     */
    void inicializarMercadoPago().catch((erroCapturado) => {
      console.warn(
        "MercadoPago.js não pôde ser inicializado:",
        erroCapturado,
      );
    });
  }, []);

  useEffect(() => {
    if (
      reserva?.emailResponsavel &&
      !emailPagamento
    ) {
      setEmailPagamento(
        reserva.emailResponsavel,
      );
    }
  }, [
    reserva?.emailResponsavel,
    emailPagamento,
  ]);

  const carregarPagamento =
    useCallback(async () => {
      if (!token) {
        return;
      }

      try {
        const atual =
          await buscarPagamentoAtual(token);

        setPagamento(atual);

        if (atual?.status === "APROVADO") {
          await carregar();
        }
      } catch (erroCapturado) {
        /*
         * A reserva continua utilizável mesmo que a consulta
         * do provedor falhe temporariamente.
         */
        console.error(
          "Falha ao consultar pagamento:",
          erroCapturado,
        );
      }
    }, [token, carregar]);

  useEffect(() => {
    if (reserva?.status === "RESERVADA") {
      void carregarPagamento();
    }
  }, [
    reserva?.status,
    carregarPagamento,
  ]);

  useEffect(() => {
    if (
      !pagamento ||
      (pagamento.status !== "PENDENTE" &&
        pagamento.status !== "PROCESSANDO")
    ) {
      return;
    }

    const intervalo = window.setInterval(() => {
      void carregarPagamento();
    }, 5000);

    return () =>
      window.clearInterval(intervalo);
  }, [pagamento, carregarPagamento]);

  useEffect(() => {
    if (
      reserva?.status !==
        "RESERVADA" ||
      !reserva.expiraEm
    ) {
      return;
    }

    const intervalo =
      window.setInterval(() => {
        setAgora(
          Date.now(),
        );
      }, 1000);

    return () =>
      window.clearInterval(
        intervalo,
      );
  }, [
    reserva?.status,
    reserva?.expiraEm,
  ]);

  const restante =
    useMemo(() => {
      if (
        !reserva?.expiraEm
      ) {
        return 0;
      }

      return (
        new Date(
          reserva.expiraEm,
        ).getTime() -
        agora
      );
    }, [
      reserva?.expiraEm,
      agora,
    ]);

  useEffect(() => {
    if (
      reserva?.status ===
        "RESERVADA" &&
      reserva.expiraEm &&
      restante <= 0
    ) {
      void carregar();
    }
  }, [
    reserva?.status,
    reserva?.expiraEm,
    restante,
    carregar,
  ]);

  if (carregando) {
    return (
      <EstadoPagina
        tipo="carregando"
        titulo="Buscando sua reserva"
      />
    );
  }

  if (
    erro ||
    !reserva
  ) {
    return (
      <EstadoPagina
        tipo="erro"
        mensagem={
          erro ??
          undefined
        }
        aoTentarNovamente={() =>
          void carregar()
        }
      />
    );
  }

  const valorUnitario =
    reserva.presente
      .valorUnitario !== null
      ? Number(
          reserva.presente
            .valorUnitario,
        )
      : null;

  const valorTotal =
    valorUnitario !== null
      ? valorUnitario *
        reserva.quantidade
      : null;

  const pagamentoEmAberto =
    pagamento?.status === "PENDENTE" ||
    pagamento?.status === "PROCESSANDO";

  async function gerarPix() {
    if (!token) {
      return;
    }

    try {
      setGerandoPix(true);
      setErro(null);

      const resultado =
        await criarPagamentoPix(
          token,
          {
            email: emailPagamento,
          },
        );

      setPagamento(resultado);
      setCodigoCopiado(false);
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível gerar o Pix.",
      );
    } finally {
      setGerandoPix(false);
    }
  }

  async function copiarCodigoPix() {
    if (!pagamento?.codigoPixCopiaCola) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        pagamento.codigoPixCopiaCola,
      );
      setCodigoCopiado(true);

      window.setTimeout(() => {
        setCodigoCopiado(false);
      }, 2200);
    } catch {
      setErro(
        "Não foi possível copiar automaticamente. Selecione o código abaixo e copie manualmente.",
      );
    }
  }

  async function cancelar() {
    if (!token) {
      return;
    }

    const confirmou =
      window.confirm(
        "Cancelar esta reserva e devolver o presente para a lista?",
      );

    if (!confirmou) {
      return;
    }

    try {
      setProcessando(true);
      setErro(null);

      const resultado =
        await cancelarReserva(
          token,
        );

      setReserva(
        resultado,
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof
          Error
          ? erroCapturado.message
          : "Não foi possível cancelar a reserva.",
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="pagina-reserva">
      <section className="reserva-status-hero">
        <RamoFloral className="reserva-status-floral" />

        <div className="reserva-status-conteudo">
          <span className="secao-etiqueta">
            Reserva de presente
          </span>

          <h1>
            {tituloStatus(
              reserva.status,
            )}
          </h1>

          <OrnamentoFloral />

          <p>
            {reserva.presente.nome}
          </p>
        </div>
      </section>

      <section className="secao reserva-status-area">
        <article className="reserva-status-cartao">
          <div className="reserva-status-topo">
            <div>
              <span className="secao-etiqueta">
                Presente escolhido
              </span>

              <h2>
                {
                  reserva.presente
                    .nome
                }
              </h2>
            </div>

            <span
              className={`reserva-status-selo reserva-status-selo--${reserva.status.toLowerCase()}`}
            >
              {
                reserva.status
              }
            </span>
          </div>

          <dl className="reserva-detalhes">
            <div>
              <dt>
                Reservado por
              </dt>
              <dd>
                {
                  reserva.nomeResponsavel
                }
              </dd>
            </div>

            <div>
              <dt>Quantidade</dt>
              <dd>
                {
                  reserva.quantidade
                }
              </dd>
            </div>

            <div>
              <dt>Total</dt>
              <dd>
                {valorTotal !==
                null
                  ? moeda.format(
                      valorTotal,
                    )
                  : "Valor livre"}
              </dd>
            </div>
          </dl>

          {reserva.status ===
            "RESERVADA" && (
            <div className="reserva-contagem">
              <span>
                Tempo restante
              </span>

              <strong>
                {formatarTempo(
                  restante,
                )}
              </strong>

              <p>
                Enquanto o relógio
                estiver correndo,
                esse presente fica
                guardado para você.
              </p>
            </div>
          )}

          {erro && (
            <p
              className="reserva-erro"
              role="alert"
            >
              {erro}
            </p>
          )}

          <div className="reserva-status-acoes">
            {reserva.status ===
              "RESERVADA" && (
              <>
                <a
                  className="botao botao--primario"
                  href="#pagamento-pix"
                >
                  Ir para pagamento
                </a>

                {!pagamento ||
                pagamento.status === "RECUSADO" ||
                pagamento.status === "CANCELADO" ||
                pagamento.status === "EXPIRADO" ? (
                  <button
                    className="botao botao--secundario"
                    type="button"
                    disabled={processando}
                    onClick={() => void cancelar()}
                  >
                    {processando
                      ? "Cancelando..."
                      : "Cancelar reserva"}
                  </button>
                ) : null}
              </>
            )}

            {reserva.status !==
              "RESERVADA" && (
              <LinkTransicao
                className="botao botao--primario"
                to="/presentes"
              >
                Voltar aos presentes
              </LinkTransicao>
            )}
          </div>
        </article>

        <aside
          id="pagamento-pix"
          className="reserva-pagamento-pix"
        >
          <header className="pix-cabecalho">
            <div>
              <span className="secao-etiqueta">
                Pagamento seguro
              </span>

              <h2>
                Pix
              </h2>
            </div>

            {pagamentoEmAberto ? (
              <span className="pix-gerado__status">
                Aguardando pagamento
              </span>
            ) : null}
          </header>

          {pagamento &&
          pagamentoEmAberto &&
          (pagamento.codigoPixCopiaCola ||
            pagamento.urlCheckout) ? (
            <div className="pix-gerado">
              <div className="pix-gerado__conteudo">
                <p className="pix-gerado__instrucao">
                  Seu Pix está pronto. Use o código abaixo ou,
                  se preferir, escaneie o QR Code no aplicativo
                  do seu banco.
                </p>

                {pagamento.codigoPixCopiaCola ? (
                  <div className="pix-copia-cola">
                    <div className="pix-copia-cola__topo">
                      <span>
                        Pix Copia e Cola
                      </span>

                      <small>
                        toque no código para selecionar
                      </small>
                    </div>

                    <textarea
                      readOnly
                      rows={3}
                      value={pagamento.codigoPixCopiaCola}
                      onFocus={(evento) =>
                        evento.currentTarget.select()
                      }
                      aria-label="Código Pix Copia e Cola"
                    />

                    <button
                      className="botao botao--claro pix-copiar"
                      type="button"
                      onClick={() => void copiarCodigoPix()}
                    >
                      {codigoCopiado
                        ? "Código copiado ✓"
                        : "Copiar código Pix"}
                    </button>
                  </div>
                ) : null}

                <div className="pix-gerado__acoes-secundarias">
                  {pagamento.urlCheckout ? (
                    <a
                      className="pix-link-mercado-pago"
                      href={pagamento.urlCheckout}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir instruções no Mercado Pago
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}

                  <p className="pix-gerado__nota">
                    Assim que o pagamento for reconhecido,
                    esta página será atualizada automaticamente.
                  </p>
                </div>
              </div>

              {pagamento.qrCodePix ? (
                <div className="pix-gerado__qr-area">
                  <span className="pix-gerado__qr-etiqueta">
                    Escaneie para pagar
                  </span>

                  <div className="pix-gerado__qr">
                    <img
                      src={`data:image/png;base64,${pagamento.qrCodePix}`}
                      alt="QR Code Pix para pagamento do presente"
                    />
                  </div>

                  <small>
                    Abra a câmera do seu banco e aponte para o código.
                  </small>
                </div>
              ) : null}
            </div>
          ) : pagamento?.status === "APROVADO" ? (
            <div className="pix-sucesso">
              <span aria-hidden="true">♡</span>

              <h3>
                Pagamento confirmado
              </h3>

              <p>
                Obrigado! A reserva foi concluída e o presente
                ficou confirmado para o casal.
              </p>
            </div>
          ) : (
            <form
              className="pix-formulario"
              onSubmit={(evento) => {
                evento.preventDefault();
                void gerarPix();
              }}
            >
              <p>
                O Pix será gerado pelo Mercado Pago. Você continua
                nesta página e pode pagar por QR Code ou Copia e Cola.
              </p>

              <label>
                <span>E-mail</span>

                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={emailPagamento}
                  onChange={(evento) =>
                    setEmailPagamento(evento.target.value)
                  }
                  placeholder="voce@email.com"
                />
              </label>

              <p className="pix-formulario__privacidade">
                O pagamento é criado pelo nosso servidor usando a
                Orders API. Seu Access Token nunca é enviado para
                o navegador.
              </p>

              <button
                className="botao botao--claro"
                type="submit"
                disabled={gerandoPix}
              >
                {gerandoPix
                  ? "Gerando Pix..."
                  : "Gerar Pix"}
              </button>
            </form>
          )}
        </aside>
      </section>
    </div>
  );
}
