import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/Floral";

import { EstadoPagina } from "../../javascript/helpers/EstadoPagina";

import {
  buscarReserva,
  cancelarReserva,
  type ReservaPresente as ReservaPresenteTipo,
} from "../../javascript/paginas/presentes/ReservaPresente";

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
                <button
                  className="botao botao--primario"
                  type="button"
                  disabled
                  title="Entrará na próxima etapa"
                >
                  Ir para pagamento
                </button>

                <button
                  className="botao botao--secundario"
                  type="button"
                  disabled={
                    processando
                  }
                  onClick={() =>
                    void cancelar()
                  }
                >
                  {processando
                    ? "Cancelando..."
                    : "Cancelar reserva"}
                </button>
              </>
            )}

            {reserva.status !==
              "RESERVADA" && (
              <Link
                className="botao botao--primario"
                to="/presentes"
              >
                Voltar aos presentes
              </Link>
            )}
          </div>
        </article>

        <aside className="reserva-pagamento-futuro">
          <span className="secao-etiqueta">
            Próxima etapa
          </span>

          <h2>
            Pagamento
          </h2>

          <p>
            Aqui entraremos com
            Pix/cartão através de um
            provedor de pagamentos.
            O token desta página será
            a ponte entre a reserva e
            a transação financeira.
          </p>

          <div className="pagamento-futuro-opcoes">
            <span>Pix</span>
            <span>Cartão</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
