import {
  LinkTransicao,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

import {
  MolduraFloral,
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/molduras/Floral";

import { EstadoPagina } from "../../javascript/helpers/EstadoPagina";

import {
  type EventoCasamento,
  useCasamento,
} from "../../javascript/paginas/eventos/Casamento";

import "../../css/paginas/home/home.css";

function formatarDataCasamento(
  data: string,
): string {
  const parteData = data.slice(0, 10);
  const [ano, mes, dia] = parteData.split("-");

  return `${dia} · ${mes} · ${ano}`;
}

function formatarHorario(
  data: string,
  fusoHorario: string,
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: fusoHorario,
  }).format(new Date(data));
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
    <>
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

      <section
        id="historia"
        className="secao secao--historia"
      >
        <div className="secao-cabecalho">
          <span className="secao-etiqueta">
            De onde viemos
          </span>

          <h2>Nossa história</h2>

          <OrnamentoFloral />

          <p>
            Aqui entra a história deles — do primeiro
            encontro aos pequenos momentos que fizeram o
            caminho chegar até o altar.
          </p>
        </div>

        <MolduraFloral
          className="historia-moldura"
          variante="destaque"
        >
          <div className="historia-cartao">
            <p>
              Este espaço ainda é editorial. Depois podemos
              transformar a história do casal em texto,
              fotografia ou uma pequena linha do tempo.
            </p>
          </div>
        </MolduraFloral>
      </section>

      <section
        id="evento"
        className="secao secao--evento"
      >
        <div className="secao-cabecalho">
          <span className="secao-etiqueta">
            Reserve a data
          </span>

          <h2>O grande dia</h2>

          <OrnamentoFloral />

          <p>
            Dois momentos do mesmo dia, cercados pelas
            pessoas que fazem parte da história de vocês.
          </p>
        </div>

        <div className="eventos-grade">
          {eventos.map((evento) => (
            <MolduraFloral
              className="evento-moldura"
              key={evento.id}
            >
              <article className="evento-cartao">
                <span
                  className="evento-icone"
                  aria-hidden="true"
                >
                  {iconeEvento(evento)}
                </span>

                <p className="evento-tipo">
                  {evento.tipo === "OUTRO"
                    ? "Evento"
                    : evento.tipo
                        .toLocaleLowerCase("pt-BR")
                        .replace(/^./, (letra) =>
                          letra.toLocaleUpperCase("pt-BR"),
                        )}
                </p>

                <h3>{evento.nome}</h3>

                <p>
                  {formatarHorario(
                    evento.inicioEm,
                    casamento.fusoHorario,
                  )}
                  {" · "}
                  {evento.local ??
                    evento.endereco ??
                    "Local a confirmar."}
                </p>
              </article>
            </MolduraFloral>
          ))}
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

          <h2>Lista de presentes</h2>

          <p>
            A presença de vocês já faz o dia especial.
            Para quem quiser contribuir com um pedacinho
            dessa nova fase, preparamos uma lista com
            carinho.
          </p>
        </div>

        <LinkTransicao
          className="botao botao--claro"
          to="/presentes"
        >
          Conhecer a lista
        </LinkTransicao>
      </section>

      <section
        id="confirmacao"
        className="secao secao--confirmacao"
      >
        <div className="confirmacao-conteudo">
          <span className="secao-etiqueta">
            Esperamos você
          </span>

          <h2>Confirme sua presença</h2>

          <OrnamentoFloral />

          <p>
            Sua resposta ajuda a gente a preparar cada
            detalhe com todo o cuidado.
          </p>

          <LinkTransicao
            className="botao botao--primario"
            to="/confirmacao"
          >
            Quero confirmar
          </LinkTransicao>
        </div>
      </section>
    </>
  );
}
