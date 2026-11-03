import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

import "../../css/global.css";
import "../../css/componentes/animacoes/animacoes.css";
import "../../css/componentes/animacoes/motion.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemento #root não foi encontrado.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
