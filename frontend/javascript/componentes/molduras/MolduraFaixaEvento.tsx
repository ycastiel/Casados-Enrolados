import molduraEventoCanto from "../../../recursos/publico/imagens/florais/moldura-evento-canto-referencia.png";
import molduraEventoCentro from "../../../recursos/publico/imagens/florais/moldura-evento-centro-referencia.png";

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
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--topo moldura-evento-especial__ornamento--superior-esquerda"
        src={molduraEventoCanto}
        alt=""
      />

      <img
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--topo moldura-evento-especial__ornamento--superior-centro"
        src={molduraEventoCentro}
        alt=""
      />

      <img
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--topo moldura-evento-especial__ornamento--superior-direita"
        src={molduraEventoCanto}
        alt=""
      />

      <img
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--base moldura-evento-especial__ornamento--inferior-esquerda"
        src={molduraEventoCanto}
        alt=""
      />

      <img
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--base moldura-evento-especial__ornamento--inferior-centro"
        src={molduraEventoCentro}
        alt=""
      />

      <img
        className="moldura-evento-especial__ornamento moldura-evento-especial__ornamento--base moldura-evento-especial__ornamento--inferior-direita"
        src={molduraEventoCanto}
        alt=""
      />
    </div>
  );
}
