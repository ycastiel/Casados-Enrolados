import type {
  ReactNode,
} from "react";

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
        <span
          className="cartao-ui__marca"
          aria-hidden="true"
        />
      )}

      <div className="cartao-ui__conteudo">
        {children}
      </div>
    </article>
  );
}
