import type {
  ReactNode,
} from "react";

import {
  MolduraFloral,
} from "../molduras/Floral";

import "../../../css/componentes/cards/suporteCartao.css";

type VarianteMoldura =
  | "cartao"
  | "destaque";

type SuporteCartaoProps = {
  children: ReactNode;
  className?: string;
  varianteMoldura?: VarianteMoldura;
};

export function SuporteCartao({
  children,
  className = "",
  varianteMoldura = "cartao",
}: SuporteCartaoProps) {
  return (
    <div
      className={[
        "suporte-cartao",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MolduraFloral
        className="suporte-cartao__moldura"
        variante={varianteMoldura}
      >
        <div className="suporte-cartao__corpo">
          {children}
        </div>
      </MolduraFloral>
    </div>
  );
}
