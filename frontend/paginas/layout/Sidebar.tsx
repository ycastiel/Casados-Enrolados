import {
  Link,
  NavLink,
} from "react-router-dom";

import "../../css/layout/sidebar.css";

export function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-conteudo">
        <Link
          className="admin-sidebar-marca"
          to="/admin"
        >
          <span
            className="admin-sidebar-simbolo"
            aria-hidden="true"
          >
            ❦
          </span>

          <span>
            Casados & Enrolados
          </span>
        </Link>

        <div className="admin-sidebar-texto">
          <span>Organização</span>
          <p>do grande dia</p>
        </div>

        <nav
          className="admin-sidebar-navegacao"
          aria-label="Navegação administrativa"
        >
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              [
                "admin-sidebar-link",
                isActive
                  ? "admin-sidebar-link--ativo"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <span aria-hidden="true">⌂</span>
            Início
          </NavLink>

          <NavLink
            to="/admin/convidados"
            className={({ isActive }) =>
              [
                "admin-sidebar-link",
                isActive
                  ? "admin-sidebar-link--ativo"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <span aria-hidden="true">❀</span>
            Convidados
          </NavLink>
        </nav>

        <div className="admin-sidebar-rodape">
          <Link
            className="admin-sidebar-site"
            to="/"
          >
            Ver site público
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
