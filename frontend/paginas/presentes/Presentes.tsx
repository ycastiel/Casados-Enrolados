// ARQUIVO: frontend/paginas/presentes/Presentes.tsx
// FUNÇÃO: Página pública da lista de presentes.
// ALTERAÇÃO: o botão "Presentear" agora abre o fluxo real de reserva.

import { Link } from "react-router-dom";

import {
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/Floral";

import { EstadoPagina } from "../../javascript/helpers/EstadoPagina";

import {
  type PresenteCasamento,
  useCasamento,
} from "../../javascript/paginas/eventos/Casamento";

import "../../css/paginas/presentes/presentes.css";

const formatadorMoeda =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );

function formatarValor(
  presente: PresenteCasamento,
): string {
  if (
    presente.valorUnitario ===
    null
  ) {
    return "Valor livre";
  }

  return formatadorMoeda.format(
    Number(
      presente.valorUnitario,
    ),
  );
}

function rotuloTipo(
  presente: PresenteCasamento,
): string {
  return presente.tipo === "COTA"
    ? "Cota especial"
    : "Presente";
}

export function Presentes() {
  const {
    dados,
    carregando,
    erro,
    recarregar,
  } = useCasamento();

  if (carregando) {
    return (
      <EstadoPagina
        tipo="carregando"
        titulo="Preparando a lista de presentes"
      />
    );
  }

  if (
    erro ||
    !dados
  ) {
    return (
      <EstadoPagina
        tipo="erro"
        mensagem={
          erro ??
          undefined
        }
        aoTentarNovamente={
          recarregar
        }
      />
    );
  }

  const presentes =
    dados.presentes;

  return (
    <div className="pagina-presentes">
      <section className="presentes-hero">
        <RamoFloral className="presentes-hero-floral presentes-hero-floral--esquerda" />
        <RamoFloral className="presentes-hero-floral presentes-hero-floral--direita" />

        <div className="presentes-hero-conteudo">
          <span className="secao-etiqueta">
            Com carinho
          </span>

          <h1>
            Lista de presentes
          </h1>

          <OrnamentoFloral />

          <p>
            O maior presente é celebrar
            esse dia juntos. Para quem
            quiser deixar mais um carinho,
            reunimos algumas ideias para
            a nova fase.
          </p>
        </div>
      </section>

      <section
        className="secao presentes-lista"
        aria-labelledby="titulo-presentes"
      >
        <div className="presentes-introducao">
          <div>
            <span className="secao-etiqueta">
              Escolha com calma
            </span>

            <h2 id="titulo-presentes">
              Um pedacinho da nossa
              história
            </h2>
          </div>

          <p>
            Cada item abaixo vem
            diretamente da lista preparada
            pelos noivos.
          </p>
        </div>

        {presentes.length ===
        0 ? (
          <div className="presentes-vazio">
            <OrnamentoFloral
              compacto
            />

            <h3>
              A lista ainda está sendo
              preparada.
            </h3>

            <p>
              Volte um pouquinho mais
              tarde para conhecer os
              presentes escolhidos.
            </p>
          </div>
        ) : (
          <div className="presentes-grade">
            {presentes.map(
              (presente) => {
                const disponivel =
                  presente.quantidadeDisponivel >
                  0;

                return (
                  <article
                    className="presente-cartao"
                    key={
                      presente.id
                    }
                  >
                    <RamoFloral className="presente-cartao-floral" />

                    <div className="presente-cartao-conteudo">
                      <span className="presente-categoria">
                        {rotuloTipo(
                          presente,
                        )}
                      </span>

                      <h3>
                        {
                          presente.nome
                        }
                      </h3>

                      <p>
                        {presente.descricao ??
                          "Um carinho para acompanhar o casal nesta nova fase."}
                      </p>

                      <div className="presente-cartao-rodape">
                        <div className="presente-valor">
                          <strong>
                            {formatarValor(
                              presente,
                            )}
                          </strong>

                          {!disponivel && (
                            <span>
                              Já
                              escolhido
                            </span>
                          )}
                        </div>

                        {disponivel ? (
                          <Link
                            className="botao botao--primario"
                            to={`/presentes/${presente.id}/reservar`}
                          >
                            Presentear
                          </Link>
                        ) : (
                          <button
                            className="botao botao--primario"
                            type="button"
                            disabled
                          >
                            Indisponível
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="presentes-recado">
        <div>
          <span className="secao-etiqueta">
            Sem obrigação
          </span>

          <h2>
            Sua presença já é presente.
          </h2>

          <p>
            A lista existe para quem pediu
            uma ajudinha para escolher.
            O que a gente quer mesmo é
            dividir o dia com pessoas
            queridas.
          </p>
        </div>
      </section>
    </div>
  );
}
