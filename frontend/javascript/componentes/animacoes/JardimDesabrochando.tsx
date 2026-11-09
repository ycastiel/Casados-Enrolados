import { FlorDesabrochando } from "./FlorDesabrochando";

import "../../../css/componentes/animacoes/motion.css";

type JardimDesabrochandoProps = {
  className?: string;
};

const FLORES = [
  {
    classe: "jardim-floral__flor jardim-floral__flor--hero-esquerda",
    tamanho: 168,
    atraso: 120,
  },
  {
    classe: "jardim-floral__flor jardim-floral__flor--hero-direita",
    tamanho: 162,
    atraso: 320,
  },
];

export function JardimDesabrochando({
  className = "",
}: JardimDesabrochandoProps) {
  return (
    <div
      className={[
        "jardim-floral",
        "jardim-floral--hero",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {FLORES.map((flor) => (
        <FlorDesabrochando
          key={flor.classe}
          className={flor.classe}
          variante="marca"
          tamanho={flor.tamanho}
          delayMs={flor.atraso}
          duracaoMs={1450}
          manterAberta
          abrirUmaVez
        />
      ))}
    </div>
  );
}

export default JardimDesabrochando;
