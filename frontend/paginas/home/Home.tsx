import {
  FloraisDesabrochandoConteudo,
} from "../../javascript/componentes/animacoes/FlorDesabrochando";

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
  FaixaImagemEditorial,
} from "../../javascript/componentes/imagens/FaixaImagemEditorial";

import {
  BlocoCanticos,
} from "../../javascript/componentes/imagens/BlocoCanticos";

import {
  BlocoImagemEditorial,
} from "../../javascript/componentes/imagens/BlocoImagemEditorial";

import aliancasFloral from "../../recursos/publico/imagens/home/aliancas-floral.webp";
import oceanoCanticos from "../../recursos/publico/imagens/home/oceano-canticos.webp";
import faixaAmor from "../../recursos/publico/imagens/home/faixa-amor.webp";
import homeHero from "../../recursos/publico/imagens/home/home-hero.webp";
import homeHeroFinal from "../../recursos/publico/imagens/home/home-hero-final.webp";
import noivosCarro from "../../recursos/publico/imagens/home/noivos-carro.webp";
import vinculo from "../../recursos/publico/imagens/home/vinculo.webp";

import {
  OrnamentoFloral,
} from "../../javascript/componentes/molduras/Floral";
import { MolduraFaixaEvento } from "../../javascript/componentes/molduras/MolduraFaixaEvento";

import { EstadoPagina } from "../../javascript/helpers/EstadoPagina";

import {
  type EventoCasamento,
  useCasamento,
} from "../../javascript/paginas/eventos/Casamento";

import "../../css/paginas/home/home.css";
import "../../css/paginas/home/homeImagens.css";

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

  const eventosDestaque =
    eventos
      .filter(
        (evento) =>
          evento.tipo === "CERIMONIA" ||
          evento.tipo === "RECEPCAO",
      )
      .slice(0, 2);

  return (
    <div className="home">
      <section
        className="hero"
        aria-labelledby="titulo-casal"
      >
        <img
          className="hero-imagem"
          src={homeHero}
          alt="Campo de lavandas sob um céu azul aberto."
        />

        <div
          className="hero-overlay"
          aria-hidden="true"
        />

        <FloraisDesabrochandoConteudo
          className="home-hero-florais-vivos florais-conteudo--hero"
          quantidade={2}
          tamanho={178}
          delayMs={100}
          variante="fundo"
        />

        <div className="hero-conteudo">
          <p className="hero-sobretitulo">
            Estamos nos casando
          </p>

          <h1
            id="titulo-casal"
            className="hero-titulo"
          >
            <span className="hero-nome hero-nome--lilas">
              {casamento.nomePessoa1}
            </span>

            <span className="hero-e">
              {" "}&amp;{" "}
            </span>

            <span className="hero-nome hero-nome--verde">
              {casamento.nomePessoa2}
            </span>
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

      <FaixaImagemEditorial
        variante="amor"
        texto="O amor permanece, confia, espera e persevera."
        referencia="1 Coríntios 13:7"
      />

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

        </div>

      </section>

      <section
        id="evento"
        className="secao secao--evento"
        aria-labelledby="titulo-grande-dia"
      >
        <MolduraFaixaEvento />

        <div className="evento-painel evento-painel--vinho-verde">
          <figure className="evento-painel__imagem">
            <img
              src={faixaAmor}
              alt="Duas mãos se aproximando diante de uma paisagem iluminada."
            />
          </figure>

          <div className="evento-painel__conteudo">
            <div className="eventos-grade eventos-grade--painel">
              <article className="evento-cartao evento-cartao--painel evento-cartao--introducao">
                <FloraisDesabrochandoConteudo
                  className="evento-cartao__flor-viva"
                  quantidade={1}
                  tamanho={102}
                  delayMs={120}
                />

                <span className="secao-etiqueta">
                  Reserve a data
                </span>

                <h2 id="titulo-grande-dia">
                  O grande dia
                </h2>

                <OrnamentoFloral compacto />

                <p className="evento-cartao__resumo">
                  Dois momentos do mesmo dia, cercados pelas
                  pessoas que fazem parte da história de vocês.
                </p>
              </article>

              {eventosDestaque.map(
                (evento) => (
                  <article
                    className="evento-cartao evento-cartao--painel"
                    key={evento.id}
                  >
                    <FloraisDesabrochandoConteudo
                      className="evento-cartao__flor-viva"
                      quantidade={1}
                      tamanho={102}
                      delayMs={160}
                    />

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
                ),
              )}
            </div>

            <div className="evento-painel__verso">
              <FloraisDesabrochandoConteudo
                className="evento-painel__verso-florais"
                quantidade={2}
                tamanho={104}
                delayMs={120}
              />

              <span
                className="evento-painel__verso-simbolo"
                aria-hidden="true"
              >
                ❦
              </span>

              <div className="evento-painel__verso-texto">
                <blockquote>
                  É melhor caminhar a dois; quando um tropeça,
                  o outro ajuda a se levantar.
                </blockquote>

                <cite>
                  Inspirado em Eclesiastes 4:9–10
                </cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="presentes"
        className="secao secao--convite"
      >
        <FloraisDesabrochandoConteudo
          className="convite-florais-vivos"
          quantidade={2}
          tamanho={136}
          delayMs={120}
        />

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

      <BlocoCanticos
        imagemMar={oceanoCanticos}
        imagemDetalhe={aliancasFloral}
        altMar="Mar azul sob nuvens iluminadas, em um cenário calmo."
        altDetalhe="Alianças douradas em uma composição floral delicada."
        etiqueta="Fé, amor e aliança"
        texto="Há amores que nem muitas águas conseguem apagar."
        referencia="Cântico dos Cânticos 8:7"
      />

      <BlocoImagemEditorial
        imagemPrincipal={noivosCarro}
        imagemApoio={vinculo}
        altPrincipal="Mãos entrelaçadas dentro de um carro, em um gesto de parceria e cuidado."
        altApoio="Pingente com coração lilás e asa metálica sobre um fundo claro."
        etiqueta="Vínculo e cuidado"
        texto="Acima de tudo, o amor é o vínculo que une com perfeição."
        referencia="Colossenses 3:14"
        posicaoImagem="center 58%"
      />

      <section
        id="confirmacao"
        className="secao secao--confirmacao"
      >
        <FloraisDesabrochandoConteudo
          className="confirmacao-home-florais-vivos"
          quantidade={2}
          tamanho={132}
          delayMs={120}
        />

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
            className="botao botao--confirmacao"
            to="/confirmacao"
          >
            Quero confirmar
          </LinkTransicao>
        </div>
      </section>

      <section
        className="home-encerramento"
        aria-label="Mensagem final"
      >
        <img
          className="home-encerramento__imagem"
          src={homeHeroFinal}
          alt="Campo de flores vermelhas sob um grande arco-íris."
        />

        <div
          className="home-encerramento__overlay"
          aria-hidden="true"
        />

        <div className="home-encerramento__conteudo">
          <span className="secao-etiqueta">
            Até o grande dia
          </span>

          <p>
            Esperamos viver esse capítulo ao lado de quem faz parte da nossa história.
          </p>
        </div>
      </section>
    </div>
  );
}

