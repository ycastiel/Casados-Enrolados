import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Layout } from "../Layout";
import { Home } from "../Home";

const router = createBrowserRouter([
  {
    element: <Layout />,

    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}