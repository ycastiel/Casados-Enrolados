// ARQUIVO: frontend/paginas/start/App.tsx
// FUNÇÃO: Mapa das rotas públicas e administrativas do frontend.

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Layout } from "../Layout";
import { Home } from "../home/Home";
import { Presentes } from "../presentes/Presentes";
import { Confirmacao } from "../eventos/Confirmacao";

import { ReservarPresente } from "../presentes/ReservarPresente";
import { ReservaPresente } from "../presentes/Reserva";

import { LayoutAdmin } from "../LayoutAdmin";
import { Admin } from "../home/HomeAdmin";
import { Convidados } from "../noivos/Convidados";

const router = createBrowserRouter([
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
    path: "/homeAdmin",
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
