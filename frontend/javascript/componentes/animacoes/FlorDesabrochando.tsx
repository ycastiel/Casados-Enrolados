import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "../../../css/componentes/animacoes/motion.css";

type VarianteFlor = "solta" | "card" | "fundo";

type PaletaFlor = {
  principal: string;
  secundaria: string;
  miolo: string;
  folha: string;
};

type FlorDesabrochandoProps = {
  className?: string;
  tamanho?: number;
  delayMs?: number;
  duracaoMs?: number;
  threshold?: number;
  variante?: VarianteFlor;
  paletas?: PaletaFlor[];
};

const PALETAS_PADRAO: PaletaFlor[] = [
  { principal: "#7f2f3f", secundaria: "#c98d96", miolo: "#e4c16f", folha: "#78886b" },
  { principal: "#a86f78", secundaria: "#e4b9b5", miolo: "#d8ad5f", folha: "#6f8065" },
  { principal: "#c79a45", secundaria: "#ecd8a0", miolo: "#8f5b43", folha: "#7f8d68" },
  { principal: "#8b7898", secundaria: "#c9b7cf", miolo: "#d7b968", folha: "#6d8168" },
  { principal: "#6f8694", secundaria: "#b8c7ce", miolo: "#d6b35e", folha: "#73806a" },
];

const PETALAS_EXTERNAS = Array.from({ length: 10 }, (_, indice) => indice);
const PETALAS_INTERNAS = Array.from({ length: 7 }, (_, indice) => indice);

export function FlorDesabrochando({
  className = "",
  tamanho = 180,
  delayMs = 500,
  duracaoMs = 1400,
  threshold = 0.42,
  variante = "solta",
  paletas = PALETAS_PADRAO,
}: FlorDesabrochandoProps) {
  const raizRef = useRef<HTMLDivElement | null>(null);
  const timerAberturaRef = useRef<number | null>(null);
  const timerConclusaoRef = useRef<number | null>(null);
  const cicloCompletoRef = useRef(false);

  const [visivel, setVisivel] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [indicePaleta, setIndicePaleta] = useState(0);

  const paletaAtual = useMemo(
    () => paletas[indicePaleta % paletas.length] ?? PALETAS_PADRAO[0],
    [indicePaleta, paletas],
  );

  function limparTimers() {
    if (timerAberturaRef.current !== null) {
      window.clearTimeout(timerAberturaRef.current);
      timerAberturaRef.current = null;
    }

    if (timerConclusaoRef.current !== null) {
      window.clearTimeout(timerConclusaoRef.current);
      timerConclusaoRef.current = null;
    }
  }

  useEffect(() => {
    const elemento = raizRef.current;
    if (!elemento) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        const entrou = entrada.isIntersecting;
        setVisivel(entrou);

        if (!entrou) {
          limparTimers();
          setAberta(false);

          if (cicloCompletoRef.current) {
            setIndicePaleta((indice) => (indice + 1) % paletas.length);
          }

          cicloCompletoRef.current = false;
          return;
        }

        timerAberturaRef.current = window.setTimeout(() => {
          setAberta(true);

          timerConclusaoRef.current = window.setTimeout(() => {
            cicloCompletoRef.current = true;
          }, duracaoMs);
        }, delayMs);
      },
      { threshold },
    );

    observer.observe(elemento);

    return () => {
      limparTimers();
      observer.disconnect();
    };
  }, [delayMs, duracaoMs, paletas.length, threshold]);

  const estilo = {
    "--flor-tamanho": `${tamanho}px`,
    "--flor-duracao": `${duracaoMs}ms`,
    "--flor-principal": paletaAtual.principal,
    "--flor-secundaria": paletaAtual.secundaria,
    "--flor-miolo": paletaAtual.miolo,
    "--flor-folha": paletaAtual.folha,
  } as CSSProperties;

  return (
    <div
      ref={raizRef}
      className={[
        "flor-desabrochando",
        `flor-desabrochando--${variante}`,
        visivel ? "is-visivel" : "",
        aberta ? "is-aberta" : "",
        className,
      ].filter(Boolean).join(" ")}
      style={estilo}
      aria-hidden="true"
    >
      <svg className="flor-desabrochando__svg" viewBox="0 0 200 200" role="presentation">
        <g className="flor-desabrochando__folhas">
          <path
            className="flor-desabrochando__folha flor-desabrochando__folha--esquerda"
            d="M91 126 C64 145, 49 163, 38 187 C64 183, 84 168, 99 139 Z"
          />
          <path
            className="flor-desabrochando__folha flor-desabrochando__folha--direita"
            d="M109 126 C136 145, 151 163, 162 187 C136 183, 116 168, 101 139 Z"
          />
        </g>

        <g className="flor-desabrochando__petalas flor-desabrochando__petalas--externas">
          {PETALAS_EXTERNAS.map((indice) => (
            <g key={`externa-${indice}`} transform={`rotate(${indice * 36} 100 100)`}>
              <path
                className="flor-desabrochando__petala flor-desabrochando__petala--externa"
                style={{ "--petala-indice": indice } as CSSProperties}
                d="M100 101 C80 86, 76 45, 100 18 C124 45, 120 86, 100 101 Z"
              />
            </g>
          ))}
        </g>

        <g className="flor-desabrochando__petalas flor-desabrochando__petalas--internas">
          {PETALAS_INTERNAS.map((indice) => (
            <g
              key={`interna-${indice}`}
              transform={`rotate(${indice * (360 / PETALAS_INTERNAS.length) + 12} 100 100)`}
            >
              <path
                className="flor-desabrochando__petala flor-desabrochando__petala--interna"
                style={{ "--petala-indice": indice } as CSSProperties}
                d="M100 103 C87 90, 87 61, 100 42 C113 61, 113 90, 100 103 Z"
              />
            </g>
          ))}
        </g>

        <g className="flor-desabrochando__miolo">
          <circle cx="100" cy="100" r="24" className="flor-desabrochando__miolo-base" />
          {Array.from({ length: 12 }, (_, indice) => {
            const angulo = (indice / 12) * Math.PI * 2;
            const cx = 100 + Math.cos(angulo) * 14;
            const cy = 100 + Math.sin(angulo) * 14;

            return (
              <circle
                key={`miolo-${indice}`}
                cx={cx}
                cy={cy}
                r="3.4"
                className="flor-desabrochando__miolo-ponto"
              />
            );
          })}
          <circle cx="100" cy="100" r="6" className="flor-desabrochando__miolo-centro" />
        </g>
      </svg>
    </div>
  );
}

export default FlorDesabrochando;
