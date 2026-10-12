import {
  type SyntheticEvent,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  LinkTransicao,
  useTransicaoPagina,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

import {
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/molduras/Floral";

import { EstadoPagina } from "../../javascript/helpers/EstadoPagina";

import {
  useCasamento,
} from "../../javascript/paginas/eventos/Casamento";

import {
  criarReserva,
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

export function ReservarPresente() {
  const { id } = useParams();

  const {
    navegar,
  } = useTransicaoPagina();

  const {
    dados,
    carregando,
    erro: erroCasamento,
    recarregar,
  } = useCasamento();

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [quantidade, setQuantidade] =
    useState(1);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const presente =
    useMemo(
      () =>
        dados?.presentes.find(
          (item) =>
            item.id === id,
        ) ?? null,
      [dados, id],
    );

  if (carregando) {
    return (
      <EstadoPagina
        tipo="carregando"
        titulo="Preparando seu presente"
      />
    );
  }

  if (
    erroCasamento ||
    !dados
  ) {
    return (
      <EstadoPagina
        tipo="erro"
        mensagem={
          erroCasamento ??
          undefined
        }
        aoTentarNovamente={
          recarregar
        }
      />
    );
  }

  if (!presente) {
    return (
      <EstadoPagina
        tipo="erro"
        mensagem="Esse presente não foi encontrado na lista."
      />
    );
  }

  const disponivel =
    presente.quantidadeDisponivel >
    0;

  const valorUnitario =
    presente.valorUnitario !==
    null
      ? Number(
          presente.valorUnitario,
        )
      : null;

  const total =
    valorUnitario !== null
      ? valorUnitario *
        quantidade
      : null;

  async function reservar(
    evento: SyntheticEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    if (!id) {
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const reserva =
        await criarReserva(
          id,
          {
            nomeResponsavel:
              nome,

            emailResponsavel:
              email || undefined,

            quantidade,
          },
        );

      navegar(
        `/presentes/reserva/${reserva.token}`,
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof
          Error
          ? erroCapturado.message
          : "Não foi possível reservar o presente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="pagina-reserva">
      <section className="reserva-hero">
        <RamoFloral className="reserva-hero-floral" />

        <div className="reserva-hero-conteudo">
          <span className="secao-etiqueta">
            Um carinho para o casal
          </span>

          <h1>
            {presente.nome}
          </h1>

          <OrnamentoFloral />

          <p>
            {presente.descricao ??
              "Um presente escolhido com carinho para essa nova fase."}
          </p>
        </div>
      </section>

      <section className="secao reserva-area">
        <div className="reserva-resumo">
          <span className="secao-etiqueta">
            Seu presente
          </span>

          <h2>
            Vamos guardar ele para você?
          </h2>

          <p>
            Ao confirmar, o presente
            fica reservado por 30 minutos.
            Se o pagamento não for
            concluído nesse período, ele
            volta automaticamente para a
            lista.
          </p>

          <dl>
            <div>
              <dt>
                Valor unitário
              </dt>
              <dd>
                {valorUnitario !==
                null
                  ? moeda.format(
                      valorUnitario,
                    )
                  : "Valor livre"}
              </dd>
            </div>

            <div>
              <dt>
                Disponíveis
              </dt>
              <dd>
                {
                  presente.quantidadeDisponivel
                }
              </dd>
            </div>

            {total !== null && (
              <div>
                <dt>Total</dt>
                <dd>
                  {moeda.format(
                    total,
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <form
          className="reserva-formulario"
          onSubmit={reservar}
        >
          <span className="secao-etiqueta">
            Seus dados
          </span>

          <label>
            Seu nome
            <input
              required
              type="text"
              value={nome}
              placeholder="Como podemos chamar você?"
              onChange={(evento) =>
                setNome(
                  evento.target
                    .value,
                )
              }
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              value={email}
              placeholder="Opcional por enquanto"
              onChange={(evento) =>
                setEmail(
                  evento.target
                    .value,
                )
              }
            />
          </label>

          <label>
            Quantidade
            <input
              required
              type="number"
              min={1}
              max={
                presente.quantidadeDisponivel
              }
              value={quantidade}
              onChange={(evento) =>
                setQuantidade(
                  Number(
                    evento.target
                      .value,
                  ),
                )
              }
            />
          </label>

          {erro && (
            <p
              className="reserva-erro"
              role="alert"
            >
              {erro}
            </p>
          )}

          <button
            className="botao botao--primario"
            type="submit"
            disabled={
              salvando ||
              !disponivel
            }
          >
            {salvando
              ? "Reservando..."
              : disponivel
                ? "Reservar presente"
                : "Presente indisponível"}
          </button>

          <LinkTransicao
            className="reserva-voltar"
            to="/presentes"
          >
            Voltar para a lista
          </LinkTransicao>
        </form>
      </section>
    </div>
  );
}
