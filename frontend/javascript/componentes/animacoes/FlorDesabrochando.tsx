import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "../../../css/componentes/animacoes/motion.css";

type VarianteFlor = "solta" | "card" | "fundo" | "marca";

type PaletaFlor = {
  principal: string;
  secundaria: string;
  miolo: string;
  estame: string;
  folha: string;
  baga: string;
};

type FlorDesabrochandoProps = {
  className?: string;
  tamanho?: number;
  delayMs?: number;
  duracaoMs?: number;
  threshold?: number;
  variante?: VarianteFlor;
  paletas?: PaletaFlor[];
  cicloContinuo?: boolean;
  intervaloMs?: number;
  deslocamentoMs?: number;
};

const PALETAS_PADRAO: PaletaFlor[] = [
  {
    principal: "#7b2635",
    secundaria: "#a74c58",
    miolo: "#6c1f2e",
    estame: "#ddb45d",
    folha: "#647253",
    baga: "#a83e48",
  },
  {
    principal: "#9a4e5b",
    secundaria: "#c67f87",
    miolo: "#71313c",
    estame: "#e1bd6d",
    folha: "#71805f",
    baga: "#b3535d",
  },
  {
    principal: "#71506f",
    secundaria: "#a5859f",
    miolo: "#52384f",
    estame: "#d9b966",
    folha: "#65745a",
    baga: "#87495f",
  },
  {
    principal: "#a86957",
    secundaria: "#c8947f",
    miolo: "#704436",
    estame: "#e0bd72",
    folha: "#72805e",
    baga: "#a74b4c",
  },
];

const PETALAS = Array.from({ length: 5 }, (_, indice) => indice);
const ESTAMES = Array.from({ length: 18 }, (_, indice) => indice);

export function FlorDesabrochando({
  className = "",
  tamanho = 180,
  delayMs = 500,
  duracaoMs = 1400,
  threshold = 0.38,
  variante = "solta",
  paletas = PALETAS_PADRAO,
  cicloContinuo = false,
  intervaloMs = 7200,
  deslocamentoMs = 0,
}: FlorDesabrochandoProps) {
  const raizRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const intervaloRef = useRef<number | null>(null);
  const cicloCompletoRef = useRef(false);

  const [visivel, setVisivel] = useState(cicloContinuo);
  const [aberta, setAberta] = useState(false);
  const [indicePaleta, setIndicePaleta] = useState(0);

  const paletaAtual = useMemo(
    () => paletas[indicePaleta % paletas.length] ?? PALETAS_PADRAO[0],
    [indicePaleta, paletas],
  );

  function limparTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    if (intervaloRef.current !== null) {
      window.clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }

  useEffect(() => {
    if (!cicloContinuo) return;

    let desmontado = false;

    const executarCiclo = () => {
      if (desmontado) return;

      setVisivel(true);
      setAberta(false);

      const abrir = window.setTimeout(() => {
        if (desmontado) return;
        setAberta(true);

        const fechar = window.setTimeout(() => {
          if (desmontado) return;
          setAberta(false);
          setIndicePaleta((indice) => (indice + 1) % paletas.length);
        }, duracaoMs + 2100);

        timersRef.current.push(fechar);
      }, delayMs);

      timersRef.current.push(abrir);
    };

    const iniciar = window.setTimeout(() => {
      executarCiclo();
      intervaloRef.current = window.setInterval(executarCiclo, intervaloMs);
    }, deslocamentoMs);

    timersRef.current.push(iniciar);

    return () => {
      desmontado = true;
      limparTimers();
    };
  }, [
    cicloContinuo,
    delayMs,
    deslocamentoMs,
    duracaoMs,
    intervaloMs,
    paletas.length,
  ]);

  useEffect(() => {
    if (cicloContinuo) return;

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

        const abrir = window.setTimeout(() => {
          setAberta(true);

          const concluir = window.setTimeout(() => {
            cicloCompletoRef.current = true;
          }, duracaoMs);

          timersRef.current.push(concluir);
        }, delayMs);

        timersRef.current.push(abrir);
      },
      { threshold },
    );

    observer.observe(elemento);

    return () => {
      limparTimers();
      observer.disconnect();
    };
  }, [
    cicloContinuo,
    delayMs,
    duracaoMs,
    paletas.length,
    threshold,
  ]);

  const estilo = {
    "--flor-tamanho": `${tamanho}px`,
    "--flor-duracao": `${duracaoMs}ms`,
    "--flor-principal": paletaAtual.principal,
    "--flor-secundaria": paletaAtual.secundaria,
    "--flor-miolo": paletaAtual.miolo,
    "--flor-estame": paletaAtual.estame,
    "--flor-folha": paletaAtual.folha,
    "--flor-baga": paletaAtual.baga,
  } as CSSProperties;

  return (
    <div
      ref={raizRef}
      className={[
        "flor-desabrochando",
        `flor-desabrochando--${variante}`,
        visivel ? "is-visivel" : "",
        aberta ? "is-aberta" : "",
        cicloContinuo ? "is-ciclo-continuo" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={estilo}
      aria-hidden="true"
    >
      <svg
        className="flor-desabrochando__svg"
        viewBox="0 0 240 240"
        role="presentation"
      >
        <g className="flor-desabrochando__ramos">
          <path
            className="flor-desabrochando__haste"
            d="M53 162 C78 143, 91 133, 105 119"
          />
          <path
            className="flor-desabrochando__haste"
            d="M187 162 C162 143, 149 133, 135 119"
          />

          <path
            className="flor-desabrochando__folha flor-desabrochando__folha--a"
            d="M83 145 C58 127, 42 132, 27 153 C48 165, 68 164, 89 151 Z"
          />
          <path
            className="flor-desabrochando__folha flor-desabrochando__folha--b"
            d="M157 145 C182 127, 198 132, 213 153 C192 165, 172 164, 151 151 Z"
          />
          <path
            className="flor-desabrochando__folha flor-desabrochando__folha--c"
            d="M88 127 C65 103, 50 101, 33 113 C47 134, 66 141, 91 136 Z"
          />
          <path
            className="flor-desabrochando__folha flor-desabrochando__folha--d"
            d="M152 127 C175 103, 190 101, 207 113 C193 134, 174 141, 149 136 Z"
          />

          {[0, 1, 2].map((indice) => (
            <circle
              key={`baga-e-${indice}`}
              className="flor-desabrochando__baga"
              cx={50 + indice * 12}
              cy={153 - indice * 11}
              r={5 - indice * 0.45}
            />
          ))}
          {[0, 1, 2].map((indice) => (
            <circle
              key={`baga-d-${indice}`}
              className="flor-desabrochando__baga"
              cx={190 - indice * 12}
              cy={153 - indice * 11}
              r={5 - indice * 0.45}
            />
          ))}
        </g>

        <g className="flor-desabrochando__petalas flor-desabrochando__petalas--secundarias">
          {PETALAS.map((indice) => (
            <g
              key={`secundaria-${indice}`}
              transform={`rotate(${indice * 72 + 36} 120 120)`}
            >
              <ellipse
                className="flor-desabrochando__petala flor-desabrochando__petala--secundaria"
                style={{ "--petala-indice": indice } as CSSProperties}
                cx="120"
                cy="82"
                rx="30"
                ry="46"
              />
            </g>
          ))}
        </g>

        <g className="flor-desabrochando__petalas flor-desabrochando__petalas--principais">
          {PETALAS.map((indice) => (
            <g
              key={`principal-${indice}`}
              transform={`rotate(${indice * 72} 120 120)`}
            >
              <ellipse
                className="flor-desabrochando__petala flor-desabrochando__petala--principal"
                style={{ "--petala-indice": indice } as CSSProperties}
                cx="120"
                cy="79"
                rx="38"
                ry="54"
              />
            </g>
          ))}
        </g>

        <g className="flor-desabrochando__miolo">
          <circle
            cx="120"
            cy="120"
            r="29"
            className="flor-desabrochando__miolo-base"
          />

          {ESTAMES.map((indice) => {
            const angulo = (indice / ESTAMES.length) * Math.PI * 2;
            const inicio = 14;
            const fim = 31 + (indice % 3) * 2.5;
            const x1 = 120 + Math.cos(angulo) * inicio;
            const y1 = 120 + Math.sin(angulo) * inicio;
            const x2 = 120 + Math.cos(angulo) * fim;
            const y2 = 120 + Math.sin(angulo) * fim;

            return (
              <g key={`estame-${indice}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="flor-desabrochando__estame-linha"
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r={2.2 + (indice % 2) * 0.45}
                  className="flor-desabrochando__estame-ponto"
                />
              </g>
            );
          })}

          <circle
            cx="120"
            cy="120"
            r="9"
            className="flor-desabrochando__miolo-centro"
          />
          <circle
            cx="120"
            cy="120"
            r="3.2"
            className="flor-desabrochando__miolo-luz"
          />
        </g>
      </svg>
    </div>
  );
}

export default FlorDesabrochando;
