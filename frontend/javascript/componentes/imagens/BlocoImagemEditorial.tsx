// ARQUIVO: frontend/javascript/componentes/imagens/BlocoImagemEditorial.tsx
// FUNÇÃO: Combina fotografia principal, fotografia de apoio e texto editorial.
// USO: cria profundidade visual sem transformar toda seção em background.

import "../../../css/componentes/imagens/blocoImagemEditorial.css";

type BlocoImagemEditorialProps = {
  imagemPrincipal: string;
  imagemApoio?: string;
  altPrincipal: string;
  altApoio?: string;
  texto: string;
  referencia?: string;
  etiqueta?: string;
};

export function BlocoImagemEditorial({
  imagemPrincipal,
  imagemApoio,
  altPrincipal,
  altApoio = "",
  texto,
  referencia,
  etiqueta = "Um amor que permanece",
}: BlocoImagemEditorialProps) {
  return (
    <section className="bloco-imagem-editorial">
      <div className="bloco-imagem-editorial__visual">
        <img
          className="bloco-imagem-editorial__principal"
          src={imagemPrincipal}
          alt={altPrincipal}
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
