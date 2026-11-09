import type { ReactNode } from "react";

import {
  FloraisDesabrochandoConteudo,
} from "../animacoes/FlorDesabrochando";

import ramoFloral from "../../../recursos/publico/imagens/florais/ramo-floral-botanico.png";
import ornamentoFloral from "../../../recursos/publico/imagens/florais/ornamento-floral-botanico.png";

import "../../../css/componentes/molduras/floral.css";

type MolduraFloralProps = {
  children: ReactNode;
  className?: string;
  variante?: "cartao" | "destaque";
};

type OrnamentoFloralProps = {
  compacto?: boolean;
  className?: string;
};

type RamoFloralProps = {
  className?: string;
};

export function RamoFloral({
  className = "",
}: RamoFloralProps) {
  return (
    <img
      className={`ramo-floral ${className}`.trim()}
      src={ramoFloral}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  );
}

export function MolduraFloral({
  children,
  className = "",
  variante = "cartao",
}: MolduraFloralProps) {
  const destaque = variante === "destaque";

  return (
    <div
      className={[
        "moldura-floral",
        `moldura-floral--${variante}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <FloraisDesabrochandoConteudo
        className="moldura-floral__florais-vivos"
        quantidade={destaque ? 2 : 1}
        tamanho={destaque ? 138 : 112}
        delayMs={120}
      />

      <div className="moldura-floral__conteudo">
        {children}
      </div>
    </div>
  );
}

export function OrnamentoFloral({
  compacto = false,
  className = "",
}: OrnamentoFloralProps) {
  return (
    <div
      className={[
        "ornamento-floral",
        compacto ? "ornamento-floral--compacto" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <img
        src={ornamentoFloral}
        alt=""
        draggable="false"
      />
    </div>
  );
}
