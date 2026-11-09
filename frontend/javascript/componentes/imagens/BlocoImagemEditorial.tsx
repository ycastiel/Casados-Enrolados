import {
  FloraisDesabrochandoConteudo,
} from "../animacoes/FlorDesabrochando";

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
        imagemApoio ? "bloco-imagem-editorial--com-apoio" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <FloraisDesabrochandoConteudo
        className="bloco-imagem-editorial__florais-vivos"
        quantidade={2}
        tamanho={142}
        delayMs={140}
      />

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

      </div>

      <div
        className={[
          "bloco-imagem-editorial__texto",
          !etiqueta ? "bloco-imagem-editorial__texto--sem-etiqueta" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {etiqueta && (
          <span className="secao-etiqueta">
            {etiqueta}
          </span>
        )}

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

        {imagemApoio && (
          <figure className="bloco-imagem-editorial__apoio">
            <img
              src={imagemApoio}
              alt={altApoio}
            />
          </figure>
        )}
      </div>
    </section>
  );
}
