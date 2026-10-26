import {
  LinkTransicao,
  NavLinkTransicao,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

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
          <span
            className="cabecalho-marca-simbolo"
            aria-hidden="true"
          >
            ❦
          </span>

          <span>
            Casados &amp; Enrolados
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
