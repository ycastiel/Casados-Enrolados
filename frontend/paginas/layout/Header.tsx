import {
  LinkTransicao,
  NavLinkTransicao,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

import { MarcaFloral } from "../../javascript/componentes/marca/MarcaFloral";

import "../../css/layout/header.css";

export function Header() {
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <LinkTransicao
          className="cabecalho-marca"
          to="/"
          aria-label="Casados & Enrolados - página inicial"
        >
          <MarcaFloral
            className="cabecalho-marca-imagem"
            variante="cabecalho"
          />

          <span className="cabecalho-marca-textos">
            <span className="cabecalho-marca-titulo">
              Casados &amp; Enrolados
            </span>
            <span className="cabecalho-marca-subtitulo">
              Noemi &amp; Maurício
            </span>
          </span>
        </LinkTransicao>

        <nav
          className="cabecalho-navegacao"
          aria-label="Navegação principal"
        >
          <LinkTransicao to="/#historia">
            Nossa história
          </LinkTransicao>

          <LinkTransicao to="/#evento">
            O grande dia
          </LinkTransicao>

          <NavLinkTransicao
            to="/presentes"
            className={({ isActive }) =>
              isActive
                ? "cabecalho-link--ativo"
                : undefined
            }
          >
            Presentes
          </NavLinkTransicao>

          <NavLinkTransicao
            to="/confirmacao"
            className={({ isActive }) =>
              [
                "cabecalho-confirmacao",
                isActive
                  ? "cabecalho-link--ativo"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            Confirmar presença
          </NavLinkTransicao>
        </nav>
      </div>
    </header>
  );
}
