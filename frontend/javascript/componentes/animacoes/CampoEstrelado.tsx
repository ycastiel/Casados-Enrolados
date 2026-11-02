import {
  CSSProperties,
  useMemo,
} from "react";

import "../../../css/componentes/animacoes/motion.css";

type IntensidadeEstrelas = "sutil" | "media";

type CampoEstreladoProps = {
  className?: string;
  quantidade?: number;
  intensidade?: IntensidadeEstrelas;
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
};

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

export function CampoEstrelado({
  className = "",
  quantidade = 22,
  intensidade = "sutil",
  semente = 2027,
}: CampoEstreladoProps) {
  const estrelas = useMemo<Estrela[]>(() => {
    const aleatorio = criarGerador(semente);

    return Array.from({ length: quantidade }, (_, indice) => ({
      id: indice,
      esquerda: aleatorio() * 100,
      topo: aleatorio() * 100,
      tamanho: 2 + aleatorio() * (intensidade === "media" ? 5 : 3.5),
      duracao: 1800 + aleatorio() * 3800,
      atraso: aleatorio() * 4800,
      opacidade: 0.32 + aleatorio() * (intensidade === "media" ? 0.56 : 0.42),
      cruz: indice % 5 === 0 || aleatorio() > 0.82,
    }));
  }, [intensidade, quantidade, semente]);

  return (
    <div
      className={[
        "campo-estrelado",
        `campo-estrelado--${intensidade}`,
        className,
      ].filter(Boolean).join(" ")}
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
        } as CSSProperties;

        return (
          <span
            key={estrela.id}
            className={[
              "campo-estrelado__estrela",
              estrela.cruz ? "campo-estrelado__estrela--cruz" : "",
            ].filter(Boolean).join(" ")}
            style={estilo}
          />
        );
      })}
    </div>
  );
}

export default CampoEstrelado;
