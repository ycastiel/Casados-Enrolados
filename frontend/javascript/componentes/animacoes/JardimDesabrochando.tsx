import { FlorDesabrochando } from "./FlorDesabrochando";

import "../../../css/componentes/animacoes/motion.css";

type JardimDesabrochandoProps = {
  className?: string;
};

const FLORES = [
  { classe: "jardim-floral__flor--1", tamanho: 118, atraso: 0 },
  { classe: "jardim-floral__flor--2", tamanho: 92, atraso: 1700 },
  { classe: "jardim-floral__flor--3", tamanho: 76, atraso: 3300 },
  { classe: "jardim-floral__flor--4", tamanho: 108, atraso: 4900 },
  { classe: "jardim-floral__flor--5", tamanho: 68, atraso: 6100 },
];

export function JardimDesabrochando({
  className = "",
}: JardimDesabrochandoProps) {
  return (
    <div
      className={["jardim-floral", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {FLORES.map((flor) => (
        <FlorDesabrochando
          key={flor.classe}
          className={["jardim-floral__flor", flor.classe].join(" ")}
          variante="marca"
          tamanho={flor.tamanho}
          delayMs={320}
          duracaoMs={1250}
          cicloContinuo
          intervaloMs={8800}
          deslocamentoMs={flor.atraso}
        />
      ))}
    </div>
  );
}

export default JardimDesabrochando;
