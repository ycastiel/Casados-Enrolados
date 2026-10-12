import { Link } from "react-router-dom";

import {
  MolduraFloral,
  OrnamentoFloral,
} from "../../javascript/componentes/Floral";

import "../../css/paginas/noivos/convidados.css";

export function Convidados() {
  return (
    <div className="admin-convidados">
      <header className="convidados-cabecalho">
        <div>
          <span className="secao-etiqueta">
            Lista de convidados
          </span>

          <h1>
            Quem vai fazer parte desse dia?
          </h1>

          <p>
            Aqui vamos reunir famílias, pessoas convidadas
            e suas confirmações. A estrutura visual já fica
            pronta para receber o primeiro CRUD real.
          </p>
        </div>

        <Link
          className="botao botao--secundario"
          to="/admin"
        >
          Voltar ao início
        </Link>
      </header>

      <MolduraFloral
        className="convidados-primeiro-passo"
        variante="destaque"
      >
        <section className="convidados-primeiro-passo-conteudo">
          <span className="secao-etiqueta">
            Próxima integração
          </span>

          <h2>
            Vamos começar pelos convites e famílias.
          </h2>

          <OrnamentoFloral compacto />

          <p>
            Como um convite pode conter mais de uma pessoa,
            o CRUD de convidados precisa respeitar a relação
            que já criamos no banco:
          </p>

          <div className="convidados-relacao">
            <span>Convite</span>
            <span aria-hidden="true">→</span>
            <span>Convidados</span>
            <span aria-hidden="true">→</span>
            <span>Confirmações</span>
          </div>

          <p className="convidados-observacao">
            Na próxima etapa, este bloco será substituído
            pela listagem real do PostgreSQL e pelo botão
            para cadastrar um novo convite/grupo.
          </p>
        </section>
      </MolduraFloral>
    </div>
  );
}
