import {
  Link,
  NavLink,
} from "react-router-dom";

import "../../css/layout/header.css";

export function Header() {
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <Link
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

          <span>Casados & Enrolados</span>
        </Link>

        <nav
          className="cabecalho-navegacao"
          aria-label="Navegação principal"
        >
          <a href="/#historia">
            Nossa história
          </a>

          <a href="/#evento">
            O grande dia
          </a>

          <NavLink
            to="/presentes"
            className={({ isActive }) =>
              isActive ? "cabecalho-link--ativo" : undefined
            }
          >
            Presentes
          </NavLink>

          <NavLink
            to="/confirmacao"
            className={({ isActive }) =>
              [
                "cabecalho-confirmacao",
                isActive ? "cabecalho-link--ativo" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            Confirmar presença
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
