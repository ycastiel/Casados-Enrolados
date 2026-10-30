import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";

import { TransicaoPagina } from "../../javascript/componentes/animacoes/TransicaoPagina";

import { Layout } from "../Layout";
import { Home } from "../home/Home";
import { Presentes } from "../presentes/Presentes";
import { Confirmacao } from "../eventos/Confirmacao";
import { ReservarPresente } from "../presentes/ReservarPresente";
import { ReservaPresente } from "../presentes/Reserva";
import { PresentesAdmin } from "../presentes/PresentesAdmin";

import { LayoutAdmin } from "../LayoutAdmin";
import { Admin } from "../home/HomeAdmin";
import { Convidados } from "../noivos/Convidados";

function LayoutTransicaoGlobal() {
  return (
    <TransicaoPagina>
      <Outlet />
    </TransicaoPagina>
  );
}

const router = createBrowserRouter([
  {
    element: <LayoutTransicaoGlobal />,

    children: [
      {
        element: <Layout />,

        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/presentes",
            element: <Presentes />,
          },
          {
            path: "/presentes/:id/reservar",
            element: <ReservarPresente />,
          },
          {
            path: "/presentes/reserva/:token",
            element: <ReservaPresente />,
          },
          {
            path: "/confirmacao",
            element: <Confirmacao />,
          },
        ],
      },

      {
        path: "/admin",
        element: <LayoutAdmin />,

        children: [
          {
            index: true,
            element: <Admin />,
          },
          {
            path: "convidados",
            element: <Convidados />,
          },
          {
            path: "presentes",
            element: <PresentesAdmin />,
          },
        ],
      },
    ],
  },
]);

export function App() {
  return (
    <RouterProvider
      router={router}
    />
  );
}
