import { Outlet } from "react-router-dom";

import { Sidebar } from "./layout/Sidebar";

import "../css/paginas/home/homeAdmin.css";

export function LayoutAdmin() {
  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-conteudo">
        <Outlet />
      </main>
    </div>
  );
}
