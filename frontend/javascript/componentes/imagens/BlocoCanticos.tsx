import "../../../css/componentes/imagens/blocoCanticos.css";

type BlocoCanticosProps = {
  imagemMar: string;
  imagemDetalhe: string;
  altMar: string;
  altDetalhe: string;
  texto: string;
  referencia: string;
  etiqueta?: string;
};

export function BlocoCanticos({
  imagemMar,
  imagemDetalhe,
  altMar,
  altDetalhe,
  texto,
  referencia,
  etiqueta = "Fé, amor e aliança",
}: BlocoCanticosProps) {
  return (
    <section
      className="bloco-canticos"
      aria-labelledby="titulo-bloco-canticos"
    >
      <div className="bloco-canticos__visual">
        <img
          className="bloco-canticos__mar"
          src={imagemMar}
          alt={altMar}
        />

        <div
          className="bloco-canticos__luz"
          aria-hidden="true"
        />
      </div>

      <div className="bloco-canticos__conteudo">
        <span className="secao-etiqueta">
          {etiqueta}
        </span>

        <span
          className="bloco-canticos__simbolo"
          aria-hidden="true"
        >
          ❦
        </span>

        <blockquote
          id="titulo-bloco-canticos"
        >
          {texto}
        </blockquote>

        <cite>
          Inspirado em {referencia}
        </cite>

        <figure className="bloco-canticos__detalhe">
          <img
            src={imagemDetalhe}
            alt={altDetalhe}
          />
        </figure>
      </div>
    </section>
  );
}
