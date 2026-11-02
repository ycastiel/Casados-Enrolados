import type { ReactNode } from "react";

type EspacoImagemProps = {
  className?: string;
  src?: string | null;
  alt?: string;
  proporcao?: "paisagem" | "retrato" | "quadrada";
  children?: ReactNode;
};

export function EspacoImagem({
  className = "",
  src,
  alt = "",
  proporcao = "paisagem",
  children,
}: EspacoImagemProps) {
  return (
    <figure
      className={[
        "ds-imagem",
        `ds-imagem--${proporcao}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="ds-imagem__placeholder" aria-label="Espaço reservado para imagem">
          <span aria-hidden="true">❦</span>
          <strong>A imagem entra aqui</strong>
          {children ? <small>{children}</small> : null}
        </div>
      )}
    </figure>
  );
}

export default EspacoImagem;
