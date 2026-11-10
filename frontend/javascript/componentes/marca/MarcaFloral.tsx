import marcaFloral from "../../../recursos/publico/imagens/marca/copodeleite-marca.png";

import "../../../css/componentes/marca/marcaFloral.css";

type MarcaFloralProps = {
  className?: string;
  variante?: "card" | "cabecalho" | "rodape";
};

export function MarcaFloral({
  className = "",
  variante = "card",
}: MarcaFloralProps) {
  return (
    <img
      className={[
        "marca-floral",
        `marca-floral--${variante}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      src={marcaFloral}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

export default MarcaFloral;
