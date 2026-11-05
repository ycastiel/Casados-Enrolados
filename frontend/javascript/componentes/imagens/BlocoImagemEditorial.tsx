import "../../../css/componentes/imagens/blocoImagemEditorial.css";

type BlocoImagemEditorialProps = {
  imagemPrincipal: string;
  imagemApoio?: string;
  altPrincipal: string;
  altApoio?: string;
  texto: string;
  referencia?: string;
  etiqueta?: string;
  inverter?: boolean;
  posicaoImagem?: string;
};

export function BlocoImagemEditorial({
  imagemPrincipal,
  imagemApoio,
  altPrincipal,
  altApoio = "",
  texto,
  referencia,
  etiqueta = "Um amor que permanece",
  inverter = false,
  posicaoImagem = "center",
}: BlocoImagemEditorialProps) {
  return (
    <section
      className={[
        "bloco-imagem-editorial",
        inverter ? "bloco-imagem-editorial--invertido" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "bloco-imagem-editorial__visual",
          !imagemApoio ? "bloco-imagem-editorial__visual--solo" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <img
          className="bloco-imagem-editorial__principal"
          src={imagemPrincipal}
          alt={altPrincipal}
          style={{ objectPosition: posicaoImagem }}
        />

        {imagemApoio && (
          <img
            className="bloco-imagem-editorial__apoio"
            src={imagemApoio}
            alt={altApoio}
          />
        )}
      </div>

      <div className="bloco-imagem-editorial__texto">
        <span className="secao-etiqueta">
          {etiqueta}
        </span>

        <span
          className="bloco-imagem-editorial__simbolo"
          aria-hidden="true"
        >
          ❦
        </span>

        <blockquote>
          {texto}
        </blockquote>

        {referencia && (
          <cite>
            Inspirado em {referencia}
          </cite>
        )}
      </div>
    </section>
  );
}
