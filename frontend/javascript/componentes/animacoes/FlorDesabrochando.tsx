import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";

import folhagemBase from "../../../recursos/publico/imagens/florais/desabrochar/folhagem-base.png";
import botaoCopoDeLeite from "../../../recursos/publico/imagens/florais/desabrochar/botao-copo-de-leite.png";
import copoDeLeiteAberto from "../../../recursos/publico/imagens/florais/desabrochar/copo-de-leite-aberto.png";
import lirioSecundario from "../../../recursos/publico/imagens/florais/desabrochar/lirio-secundario.png";

import "../../../css/componentes/animacoes/motion.css";

type VarianteFlor = "solta" | "card" | "fundo" | "marca";

type FlorDesabrochandoProps = {
  className?: string;
  tamanho?: number;
  delayMs?: number;
  duracaoMs?: number;
  threshold?: number;
  variante?: VarianteFlor;
  cicloContinuo?: boolean;
  intervaloMs?: number;
  deslocamentoMs?: number;
  manterAberta?: boolean;
  abrirUmaVez?: boolean;
  ativoExterno?: boolean;
};

type FloraisDesabrochandoConteudoProps = {
  className?: string;
  quantidade?: 1 | 2;
  tamanho?: number;
  delayMs?: number;
  duracaoMs?: number;
  threshold?: number;
  variante?: VarianteFlor;
};

export function FlorDesabrochando({
  className = "",
  tamanho = 180,
  delayMs = 500,
  duracaoMs = 1400,
  threshold = 0.32,
  variante = "solta",
  cicloContinuo = false,
  intervaloMs = 7200,
  deslocamentoMs = 0,
  manterAberta = true,
  abrirUmaVez = true,
  ativoExterno,
}: FlorDesabrochandoProps) {
  const raizRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const intervaloRef = useRef<number | null>(null);
  const jaAtivouRef = useRef(false);

  const [visivel, setVisivel] = useState(cicloContinuo);
  const [aberta, setAberta] = useState(false);

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

        if (!manterAberta) {
          const desaparecer = window.setTimeout(() => {
            if (desmontado) return;
            setAberta(false);
          }, duracaoMs + 2600);

          timersRef.current.push(desaparecer);
        }
      }, delayMs);

      timersRef.current.push(abrir);
    };

    const iniciar = window.setTimeout(() => {
      executarCiclo();

      if (!manterAberta) {
        intervaloRef.current = window.setInterval(executarCiclo, intervaloMs);
      }
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
    manterAberta,
  ]);

  useEffect(() => {
    if (cicloContinuo || ativoExterno === undefined) return;

    if (!ativoExterno) {
      if (!jaAtivouRef.current) {
        setVisivel(false);
        setAberta(false);
        limparTimers();
      }
      return;
    }

    if (abrirUmaVez && jaAtivouRef.current) {
      setVisivel(true);
      setAberta(true);
      return;
    }

    jaAtivouRef.current = true;
    setVisivel(true);

    const abrir = window.setTimeout(() => {
      setAberta(true);
    }, delayMs);

    timersRef.current.push(abrir);

    return () => {
      limparTimers();
    };
  }, [
    abrirUmaVez,
    ativoExterno,
    cicloContinuo,
    delayMs,
  ]);

  useEffect(() => {
    if (cicloContinuo || ativoExterno !== undefined) return;

    const elemento = raizRef.current;
    if (!elemento) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        const entrou = entrada.isIntersecting;

        if (!entrou && !jaAtivouRef.current) {
          setVisivel(false);
          setAberta(false);
          limparTimers();
          return;
        }

        if (!entrou) return;

        if (abrirUmaVez && jaAtivouRef.current) {
          setVisivel(true);
          setAberta(true);
          return;
        }

        jaAtivouRef.current = true;
        setVisivel(true);

        const abrir = window.setTimeout(() => {
          setAberta(true);
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
    abrirUmaVez,
    ativoExterno,
    cicloContinuo,
    delayMs,
    threshold,
  ]);

  const estilo = {
    "--flor-tamanho": `${tamanho}px`,
    "--flor-duracao": `${duracaoMs}ms`,
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
      <span className="flor-desabrochando__halo" />

      <img
        className="flor-desabrochando__camada flor-desabrochando__camada--folhagem"
        src={folhagemBase}
        alt=""
        draggable={false}
      />

      <img
        className="flor-desabrochando__camada flor-desabrochando__camada--botao"
        src={botaoCopoDeLeite}
        alt=""
        draggable={false}
      />

      <img
        className="flor-desabrochando__camada flor-desabrochando__camada--lirio"
        src={lirioSecundario}
        alt=""
        draggable={false}
      />

      <img
        className="flor-desabrochando__camada flor-desabrochando__camada--principal"
        src={copoDeLeiteAberto}
        alt=""
        draggable={false}
      />
    </div>
  );
}

export function FloraisDesabrochandoConteudo({
  className = "",
  quantidade = 2,
  tamanho = 126,
  delayMs = 140,
  duracaoMs = 1400,
  threshold = 0.26,
  variante = "card",
}: FloraisDesabrochandoConteudoProps) {
  const raizRef = useRef<HTMLDivElement | null>(null);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const elemento = raizRef.current;
    if (!elemento || ativo) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;

        setAtivo(true);
        observer.disconnect();
      },
      { threshold },
    );

    observer.observe(elemento);

    return () => {
      observer.disconnect();
    };
  }, [ativo, threshold]);

  return (
    <div
      ref={raizRef}
      className={[
        "florais-conteudo",
        quantidade === 1
          ? "florais-conteudo--uma"
          : "florais-conteudo--duas",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {quantidade === 2 && (
        <FlorDesabrochando
          className="florais-conteudo__flor florais-conteudo__flor--superior-esquerda"
          variante={variante}
          tamanho={tamanho}
          delayMs={delayMs}
          duracaoMs={duracaoMs}
          threshold={threshold}
          manterAberta
          abrirUmaVez
          ativoExterno={ativo}
        />
      )}

      <FlorDesabrochando
        className="florais-conteudo__flor florais-conteudo__flor--inferior-direita"
        variante={variante}
        tamanho={tamanho}
        delayMs={delayMs + (quantidade === 2 ? 180 : 0)}
        duracaoMs={duracaoMs}
        threshold={threshold}
        manterAberta
        abrirUmaVez
        ativoExterno={ativo}
      />
    </div>
  );
}

export default FlorDesabrochando;
