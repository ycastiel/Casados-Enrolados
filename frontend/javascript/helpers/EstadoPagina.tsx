import { OrnamentoFloral } from "../componentes/molduras/Floral";

import "../../css/helpers/estados.css";

type EstadoPaginaProps = {
  tipo: "carregando" | "erro";
  titulo?: string;
  mensagem?: string;
  aoTentarNovamente?: () => void;
};

export function EstadoPagina({
  tipo,
  titulo,
  mensagem,
  aoTentarNovamente,
}: EstadoPaginaProps) {
  const carregando = tipo === "carregando";

  return (
    <section
      className={`estado-pagina estado-pagina--${tipo}`}
      aria-live="polite"
      aria-busy={carregando}
    >
      <div className="estado-pagina-conteudo">
        <span
          className="estado-pagina-simbolo"
          aria-hidden="true"
        >
          {carregando ? "❦" : "✦"}
        </span>

        <span className="secao-etiqueta">
          {carregando
            ? "Só um instante"
            : "Algo saiu do roteiro"}
        </span>

        <h1>
          {titulo ??
            (carregando
              ? "Estamos preparando os detalhes"
              : "Não conseguimos carregar esta parte")}
        </h1>

        <OrnamentoFloral compacto />

        <p>
          {mensagem ??
            (carregando
              ? "As flores já estão no lugar. Falta só buscar as informações do grande dia."
              : "Tente novamente em alguns instantes.")}
        </p>

        {!carregando && aoTentarNovamente && (
          <button
            className="botao botao--primario"
            type="button"
            onClick={aoTentarNovamente}
          >
            Tentar novamente
          </button>
        )}
      </div>
    </section>
  );
}
