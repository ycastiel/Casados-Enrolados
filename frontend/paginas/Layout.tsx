import { Outlet } from "react-router-dom";

import { Footer } from "./layout/Footer";
import { Header } from "./layout/Header";

const PETALAS = 11;

export function Layout() {
  return (
    <div className="layout-publico">
      <div
        className="petalas"
        aria-hidden="true"
      >
        {Array.from(
          {
            length: PETALAS,
          },
          (_, indice) => (
            <span
              key={indice}
              className={`petala petala--${indice + 1}`}
            />
          ),
        )}
      </div>

      <Header />

      <main className="conteudo-principal">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
