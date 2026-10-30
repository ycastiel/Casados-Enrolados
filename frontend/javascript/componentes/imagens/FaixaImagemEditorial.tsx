// ARQUIVO: frontend/javascript/componentes/imagens/FaixaImagemEditorial.tsx
// FUNÇÃO: Faixa fotográfica reutilizável para criar pausas visuais entre seções.
// IMAGENS: são definidas via CSS por variante, então o componente funciona mesmo antes de a foto existir.

import "../../../css/componentes/imagens/faixaImagemEditorial.css";

type VarianteFaixaImagem =
  | "amor"
  | "jardim";

type FaixaImagemEditorialProps = {
  texto: string;
  referencia?: string;
  variante?: VarianteFaixaImagem;
};

export function FaixaImagemEditorial({
  texto,
  referencia,
  variante = "amor",
}: FaixaImagemEditorialProps) {
  return (
    <section
      className={[
        "faixa-imagem-editorial",
        `faixa-imagem-editorial--${variante}`,
      ].join(" ")}
    >
      <div
        className="faixa-imagem-editorial__imagem"
        aria-hidden="true"
      />

      <div className="faixa-imagem-editorial__sobreposicao">
        <span
          className="faixa-imagem-editorial__simbolo"
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
