import type {
  ReactNode,
} from "react";

import { MarcaFloral } from "../marca/MarcaFloral";

import "../../../css/componentes/cards/cartao.css";

type VarianteCartao =
  | "papel"
  | "botanico"
  | "vinho"
  | "sutil";

type CartaoProps = {
  children: ReactNode;
  className?: string;
  variante?: VarianteCartao;
  interativo?: boolean;
  marca?: boolean;
};

export function Cartao({
  children,
  className = "",
  variante = "papel",
  interativo = false,
  marca = true,
}: CartaoProps) {
  return (
    <article
      className={[
        "cartao-ui",
        `cartao-ui--${variante}`,
        interativo
          ? "cartao-ui--interativo"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {marca && (
        <MarcaFloral
          className="cartao-ui__marca"
          variante="card"
        />
      )}

      <div className="cartao-ui__conteudo">
        {children}
      </div>
    </article>
  );
}
