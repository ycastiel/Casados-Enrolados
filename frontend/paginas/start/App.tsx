import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Layout } from "../Layout";
import { Home } from "../Home";
import { Presentes } from "../presentes/Presentes";
import { Confirmacao } from "../eventos/Confirmacao";

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
]);

export function App() {
  return <RouterProvider router={router} />;
}
