import { RouterProvider } from "react-router-dom";

import { router } from "./Router.js";

export function App() {
  return <RouterProvider router={router} />;
}