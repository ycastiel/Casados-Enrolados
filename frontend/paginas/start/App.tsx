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
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
