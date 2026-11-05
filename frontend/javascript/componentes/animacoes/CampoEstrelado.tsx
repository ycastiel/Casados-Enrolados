import {
  CSSProperties,
  useMemo,
} from "react";

import "../../../css/componentes/animacoes/motion.css";

type IntensidadeEstrelas = "sutil" | "media";
type DistribuicaoEstrelas = "uniforme" | "bordas";

type CampoEstreladoProps = {
  className?: string;
  quantidade?: number;
  intensidade?: IntensidadeEstrelas;
  distribuicao?: DistribuicaoEstrelas;
  semente?: number;
};

type Estrela = {
  id: number;
  esquerda: number;
  topo: number;
  tamanho: number;
  duracao: number;
  atraso: number;
  opacidade: number;
  cruz: boolean;
  cor: string;
};

const CORES_ESTRELAS = [
  "rgba(226, 202, 131, 0.98)",
  "rgba(255, 249, 229, 0.96)",
  "rgba(194, 161, 79, 0.92)",
  "rgba(170, 184, 159, 0.82)",
];

function criarGerador(semente: number) {
  let valor = semente >>> 0;

  return () => {
    valor += 0x6d2b79f5;

    let resultado = valor;
    resultado = Math.imul(resultado ^ (resultado >>> 15), resultado | 1);
    resultado ^= resultado + Math.imul(resultado ^ (resultado >>> 7), resultado | 61);

    return ((resultado ^ (resultado >>> 14)) >>> 0) / 4294967296;
  };
}

function gerarPosicaoHorizontal(
  aleatorio: () => number,
  distribuicao: DistribuicaoEstrelas,
) {
  if (distribuicao === "uniforme") return aleatorio() * 100;

  const ladoEsquerdo = aleatorio() > 0.5;
  const margem = 4 + aleatorio() * 22;

  return ladoEsquerdo ? margem : 100 - margem;
}

export function CampoEstrelado({
  className = "",
  quantidade = 28,
  intensidade = "sutil",
  distribuicao = "uniforme",
  semente = 2027,
}: CampoEstreladoProps) {
  const estrelas = useMemo<Estrela[]>(() => {
    const aleatorio = criarGerador(semente);

    return Array.from({ length: quantidade }, (_, indice) => ({
      id: indice,
      esquerda: gerarPosicaoHorizontal(aleatorio, distribuicao),
      topo: 4 + aleatorio() * 92,
      tamanho: 2.4 + aleatorio() * (intensidade === "media" ? 6.4 : 4.5),
      duracao: 1900 + aleatorio() * 4200,
      atraso: aleatorio() * 5200,
      opacidade: 0.48 + aleatorio() * (intensidade === "media" ? 0.5 : 0.38),
      cruz: indice % 4 === 0 || aleatorio() > 0.74,
      cor: CORES_ESTRELAS[Math.floor(aleatorio() * CORES_ESTRELAS.length)],
    }));
  }, [distribuicao, intensidade, quantidade, semente]);

  return (
    <div
      className={[
        "campo-estrelado",
        `campo-estrelado--${intensidade}`,
        `campo-estrelado--${distribuicao}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {estrelas.map((estrela) => {
        const estilo = {
          "--estrela-left": `${estrela.esquerda}%`,
          "--estrela-top": `${estrela.topo}%`,
          "--estrela-size": `${estrela.tamanho}px`,
          "--estrela-duration": `${estrela.duracao}ms`,
          "--estrela-delay": `${estrela.atraso}ms`,
          "--estrela-opacity": estrela.opacidade,
          "--estrela-color": estrela.cor,
        } as CSSProperties;

        return (
          <span
            key={estrela.id}
            className={[
              "campo-estrelado__estrela",
              estrela.cruz ? "campo-estrelado__estrela--cruz" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={estilo}
          />
        );
      })}
    </div>
  );
}

export default CampoEstrelado;
