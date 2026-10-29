import type { ReactNode } from "react";

import ramoFloral from "../../../recursos/publico/svg/ramo-floral.svg";
import ornamentoFloral from "../../../recursos/publico/svg/ornamento-floral.svg";

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
      <RamoFloral className="moldura-floral__ramo moldura-floral__ramo--superior" />
      <RamoFloral className="moldura-floral__ramo moldura-floral__ramo--inferior" />

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
