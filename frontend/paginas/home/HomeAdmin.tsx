import {
  LinkTransicao,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

import {
  Cartao,
} from "../../javascript/componentes/cards/Cartao";

import {
  OrnamentoFloral,
  RamoFloral,
} from "../../javascript/componentes/molduras/Floral";

export function Admin() {
  return (
    <div className="admin-inicio">
      <section className="admin-boas-vindas">
        <RamoFloral className="admin-boas-vindas-floral" />

        <div className="admin-boas-vindas-conteudo">
          <span className="secao-etiqueta">
            Organização do grande dia
          </span>

          <h1>
            Olá 🌿
          </h1>

          <p>
            Este é o cantinho de organização do casamento.
            A ideia aqui é deixar tudo simples, leve e fácil
            de encontrar — sem transformar os preparativos
            em planilha de multinacional.
          </p>
        </div>
      </section>

      <section
        className="admin-secao"
        aria-labelledby="titulo-organizacao"
      >
        <div className="admin-secao-cabecalho">
          <div>
            <span className="secao-etiqueta">
              Por onde começar
            </span>

            <h2 id="titulo-organizacao">
              Preparativos
            </h2>
          </div>

          <p>
            Cada espaço vai cuidar de uma parte do casamento.
            Começaremos pelos convidados e pela lista de presentes.
          </p>
        </div>

        <div className="admin-acoes">
          <Cartao
            className="admin-acao"
            variante="botanico"
            interativo
          >
            <span className="admin-acao-numero">
              01
            </span>

            <div>
              <h3>Convidados</h3>

              <p>
                Organize famílias, convites, acompanhantes
                e, em seguida, as confirmações de presença.
              </p>
            </div>

            <LinkTransicao
              className="botao botao--primario"
              to="/admin/convidados"
            >
              Organizar convidados
            </LinkTransicao>
          </Cartao>

          <Cartao
            className="admin-acao"
            variante="papel"
            interativo
          >
            <span className="admin-acao-numero">
              02
            </span>

            <div>
              <h3>Presentes</h3>

              <p>
                Cadastre itens, organize a ordem da lista,
                acompanhe disponibilidade e reservas ativas.
              </p>
            </div>

            <LinkTransicao
              className="botao botao--primario"
              to="/admin/presentes"
            >
              Organizar presentes
            </LinkTransicao>
          </Cartao>

          <Cartao
            className="admin-acao admin-acao--pagamentos"
            variante="sutil"
            interativo
          >
            <span className="admin-acao-numero">
              03
            </span>

            <div>
              <h3>Pagamentos</h3>

              <p>
                Acompanhe tentativas, valores e confirmações
                vinculadas às reservas de presentes.
              </p>
            </div>

            <LinkTransicao
              className="botao botao--primario"
              to="/admin/pagamentos"
            >
              Organizar pagamentos
            </LinkTransicao>
          </Cartao>

          <Cartao
            className="admin-acao"
            variante="sutil"
          >
            <span className="admin-acao-numero">
              04
            </span>

            <div>
              <h3>Confirmações</h3>

              <p>
                Aqui ficará a visão de quem confirmou,
                recusou ou ainda não respondeu ao convite.
              </p>
            </div>

            <span className="admin-em-breve">
              Em breve
            </span>
          </Cartao>
        </div>
      </section>

      <section className="admin-recado">
        <OrnamentoFloral compacto />

        <h2>
          Um passo de cada vez.
        </h2>

        <p>
          O painel vai crescer junto com as necessidades
          reais do casamento, sem adicionar ferramenta só
          porque “todo sistema precisa ter”.
        </p>

        <LinkTransicao
          className="botao botao--secundario"
          to="/"
        >
          Ver o site dos convidados
        </LinkTransicao>
      </section>
    </div>
  );
}
