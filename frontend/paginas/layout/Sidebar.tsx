import {
  LinkTransicao,
  NavLinkTransicao,
} from "../../javascript/componentes/animacoes/TransicaoPagina";

import "../../css/layout/sidebar.css";

export function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-conteudo">
        <LinkTransicao
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
            Casados &amp; Enrolados
          </span>
        </LinkTransicao>

        <div className="admin-sidebar-texto">
          <span>Organização</span>
          <p>do grande dia</p>
        </div>

        <nav
          className="admin-sidebar-navegacao"
          aria-label="Navegação administrativa"
        >
          <NavLinkTransicao
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
            <span aria-hidden="true">
              ⌂
            </span>
            Início
          </NavLinkTransicao>

          <NavLinkTransicao
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
            <span aria-hidden="true">
              ❀
            </span>
            Convidados
          </NavLinkTransicao>
        </nav>

        <div className="admin-sidebar-rodape">
          <LinkTransicao
            className="admin-sidebar-site"
            to="/"
          >
            Ver site público
            <span aria-hidden="true">
              ↗
            </span>
          </LinkTransicao>
        </div>
      </div>
    </aside>
  );
}
