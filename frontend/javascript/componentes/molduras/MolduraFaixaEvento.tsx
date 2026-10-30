import molduraEventoFloral from "../../../recursos/publico/svg/moldura-evento-floral.svg";

type MolduraFaixaEventoProps = {
  className?: string;
};

export function MolduraFaixaEvento({
  className = "",
}: MolduraFaixaEventoProps) {
  return (
    <div
      className={[
        "moldura-evento-especial",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <img
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--topo"
        src={molduraEventoFloral}
        alt=""
      />

      <img
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--base"
        src={molduraEventoFloral}
        alt=""
      />
    </div>
  );
}
