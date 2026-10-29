import {
  LinkTransicao,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

import {
  ContagemRegressiva,
} from "../../javascript/paginas/home/ContagemRegressiva";

import {
  SuporteCartao,
} from "../../javascript/componentes/cards/SuporteCartao";

import {
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/molduras/Floral";

import { EstadoPagina } from "../../javascript/helpers/EstadoPagina";

import {
  type EventoCasamento,
  useCasamento,
} from "../../javascript/paginas/eventos/Casamento";

import "../../css/paginas/home/home.css";

type VersoEditorialProps = {
  texto: string;
  referencia: string;
  variante?: "claro" | "verde" | "vinho";
  compacto?: boolean;
};

function VersoEditorial({
  texto,
  referencia,
  variante = "claro",
  compacto = false,
}: VersoEditorialProps) {
  return (
    <aside
      className={[
        "verso-editorial",
        `verso-editorial--${variante}`,
        compacto
          ? "verso-editorial--compacto"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="verso-editorial__simbolo"
        aria-hidden="true"
      >
        ❦
      </span>

      <blockquote>
        {texto}
      </blockquote>

      <cite>
        Inspirado em {referencia}
      </cite>
    </aside>
  );
}

function formatarDataCasamento(
  data: string,
): string {
  const parteData =
    data.slice(0, 10);

  const [
    ano,
    mes,
    dia,
  ] =
    parteData.split("-");

  return `${dia} · ${mes} · ${ano}`;
}

function formatarDataEvento(
  data: string,
  fusoHorario: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      timeZone: fusoHorario,
    },
  ).format(
    new Date(data),
  );
}

function formatarHorario(
  data: string,
  fusoHorario: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: fusoHorario,
    },
  ).format(
    new Date(data),
  );
}

function iconeEvento(
  evento: EventoCasamento,
): string {
  switch (evento.tipo) {
    case "CERIMONIA":
      return "✦";

    case "RECEPCAO":
      return "❦";

    case "FESTA":
      return "✧";

    default:
      return "·";
  }
}

function nomeTipoEvento(
  evento: EventoCasamento,
): string {
  if (evento.tipo === "OUTRO") {
    return "Evento";
  }

  return evento.tipo
    .toLocaleLowerCase("pt-BR")
    .replace(
      /^./,
      (letra) =>
        letra.toLocaleUpperCase("pt-BR"),
    );
}

export function Home() {
  const {
    dados,
    carregando,
    erro,
    recarregar,
  } = useCasamento();

  if (carregando) {
    return (
      <EstadoPagina tipo="carregando" />
    );
  }

  if (erro || !dados) {
    return (
      <EstadoPagina
        tipo="erro"
        mensagem={erro ?? undefined}
        aoTentarNovamente={recarregar}
      />
    );
  }

  const {
    casamento,
    eventos,
  } = dados;

  return (
    <div className="home">
      <section
        className="hero"
        aria-labelledby="titulo-casal"
      >
        <RamoFloral className="hero-floral hero-floral--esquerda" />
        <RamoFloral className="hero-floral hero-floral--direita" />

        <div className="hero-conteudo">
          <p className="hero-sobretitulo">
            Estamos nos casando
          </p>

          <h1
            id="titulo-casal"
            className="hero-titulo"
          >
            {casamento.nomePessoa1}

            <span className="hero-e">
              {" "}&amp;{" "}
            </span>

            {casamento.nomePessoa2}
          </h1>

          <OrnamentoFloral compacto />

          <p className="hero-data">
            {formatarDataCasamento(
              casamento.dataCasamento,
            )}
          </p>

          <p className="hero-mensagem">
            {casamento.descricao ??
              "Entre flores, histórias e pessoas queridas, queremos dividir com você um dos capítulos mais bonitos da nossa vida."}
          </p>

          <div className="hero-acoes">
            <LinkTransicao
              className="botao botao--primario"
              to="/confirmacao"
            >
              Confirmar presença
            </LinkTransicao>

            <LinkTransicao
              className="botao botao--secundario"
              to="/presentes"
            >
              Ver lista de presentes
            </LinkTransicao>
          </div>
        </div>
      </section>

      <div className="home-contagem">
        <ContagemRegressiva
          casamento={casamento}
          eventos={eventos}
        />
      </div>

      <div className="home-verso home-verso--primeiro">
        <VersoEditorial
          texto="O amor permanece, confia, espera e persevera."
          referencia="1 Coríntios 13:7"
          variante="claro"
        />
      </div>

      <section
        id="historia"
        className="secao secao--historia"
      >
        <div className="secao-cabecalho">
          <span className="secao-etiqueta">
            De onde viemos
          </span>

          <h2>
            Nossa história
          </h2>

          <OrnamentoFloral />

          <p>
            Aqui entra a história deles — do primeiro encontro
            aos pequenos momentos que fizeram o caminho chegar
            até o altar.
          </p>
        </div>

        <div className="historia-cenario">
          <span
            className="historia-cenario__mancha historia-cenario__mancha--esquerda"
            aria-hidden="true"
          />

          <span
            className="historia-cenario__mancha historia-cenario__mancha--direita"
            aria-hidden="true"
          />

          <SuporteCartao
            className="historia-suporte"
            varianteMoldura="destaque"
          >
            <div className="historia-cartao">
              <span className="historia-cartao__sobretitulo">
                Um capítulo contado com carinho
              </span>

              <p>
                Este espaço ainda é editorial. Depois podemos
                transformar a história do casal em texto,
                fotografia ou uma pequena linha do tempo.
              </p>

              <span
                className="historia-cartao__assinatura"
                aria-hidden="true"
              >
                ❦
              </span>
            </div>
          </SuporteCartao>

          <div className="historia-verso">
            <VersoEditorial
              texto="É melhor caminhar a dois; quando um tropeça, o outro ajuda a se levantar."
              referencia="Eclesiastes 4:9–10"
              variante="verde"
              compacto
            />
          </div>
        </div>
      </section>

      <section
        id="evento"
        className="secao secao--evento"
      >
        <div
          className="evento-fundo-texto"
          aria-hidden="true"
        >
          {formatarDataCasamento(
            casamento.dataCasamento,
          )}
        </div>

        <div className="secao-cabecalho">
          <span className="secao-etiqueta">
            Reserve a data
          </span>

          <h2>
            O grande dia
          </h2>

          <OrnamentoFloral />

          <p>
            Dois momentos do mesmo dia, cercados pelas pessoas
            que fazem parte da história de vocês.
          </p>
        </div>

        <div className="eventos-palco">
          <div
            className="eventos-palco__linha"
            aria-hidden="true"
          />

          <div className="eventos-grade">
            {eventos.map(
              (
                evento,
                indice,
              ) => (
                <SuporteCartao
                  className={[
                    "evento-suporte",
                    indice % 2 === 1
                      ? "evento-suporte--deslocado"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={evento.id}
                  varianteMoldura="cartao"
                >
                  <article className="evento-cartao">
                    <span
                      className="evento-icone"
                      aria-hidden="true"
                    >
                      {iconeEvento(evento)}
                    </span>

                    <p className="evento-tipo">
                      {nomeTipoEvento(evento)}
                    </p>

                    <h3>
                      {evento.nome}
                    </h3>

                    <p className="evento-data">
                      {formatarDataEvento(
                        evento.inicioEm,
                        casamento.fusoHorario,
                      )}
                    </p>

                    <div className="evento-divisor">
                      <span />
                      <span>❦</span>
                      <span />
                    </div>

                    <p className="evento-detalhes">
                      <strong>
                        {formatarHorario(
                          evento.inicioEm,
                          casamento.fusoHorario,
                        )}
                      </strong>

                      <span>
                        {evento.local ??
                          evento.endereco ??
                          "Local a confirmar."}
                      </span>
                    </p>
                  </article>
                </SuporteCartao>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="presentes"
        className="secao secao--convite"
      >
        <RamoFloral className="convite-floral" />

        <div className="convite-conteudo">
          <span className="secao-etiqueta">
            Com carinho
          </span>

          <h2>
            Lista de presentes
          </h2>

          <p>
            A presença de vocês já faz o dia especial.
            Para quem quiser contribuir com um pedacinho
            dessa nova fase, preparamos uma lista com carinho.
          </p>
        </div>

        <LinkTransicao
          className="botao botao--claro"
          to="/presentes"
        >
          Conhecer a lista
        </LinkTransicao>
      </section>

      <div className="home-verso home-verso--final">
        <VersoEditorial
          texto="Há amores que nem muitas águas conseguem apagar."
          referencia="Cântico dos Cânticos 8:7"
          variante="vinho"
        />
      </div>

      <section
        id="confirmacao"
        className="secao secao--confirmacao"
      >
        <div className="confirmacao-conteudo">
          <span className="secao-etiqueta">
            Esperamos você
          </span>

          <h2>
            Confirme sua presença
          </h2>

          <OrnamentoFloral />

          <p>
            Sua resposta ajuda a gente a preparar cada detalhe
            com todo o cuidado.
          </p>

          <LinkTransicao
            className="botao botao--primario"
            to="/confirmacao"
          >
            Quero confirmar
          </LinkTransicao>
        </div>
      </section>
    </div>
  );
}
