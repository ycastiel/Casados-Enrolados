import { Outlet } from "react-router-dom";

import { CampoEstrelado } from "../javascript/componentes/animacoes/CampoEstrelado";

import { Sidebar } from "./layout/Sidebar";

import "../css/paginas/home/homeAdmin.css";

export function LayoutAdmin() {
  return (
    <div className="admin-layout">
      <CampoEstrelado
        className="admin-layout-estrelas"
        quantidade={12}
        intensidade="sutil"
        semente={20270516}
      />
      <Sidebar />

      <main className="admin-conteudo">
        <Outlet />
      </main>
    </div>
  );
}
