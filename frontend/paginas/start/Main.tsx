import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

import "../../css/layout/global.css";
import "../../css/animacoes/animacoes.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemento #root não foi encontrado.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
