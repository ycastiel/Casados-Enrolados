import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  type LinkProps,
  NavLink,
  type NavLinkProps,
  type To,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../../../css/componentes/animacoes/transicaoPagina.css";

type FaseTransicao =
  | "pronta"
  | "saindo"
  | "interludio"
  | "entrando";

type ContextoTransicao = {
  fase: FaseTransicao;
  navegando: boolean;
  navegar: (destino: To) => void;
};

type TransicaoPaginaProps = {
  children: ReactNode;
};

const Contexto =
  createContext<ContextoTransicao | null>(null);

const DURACAO_SAIDA = 260;
const DURACAO_INTERLUDIO = 180;
const DURACAO_ENTRADA = 360;

function prefereMovimentoReduzido() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
  );
}

function rolarAposNavegacao(
  destino: To,
) {
  if (
    typeof destino === "string" &&
    destino.includes("#")
  ) {
    const hash =
      destino.split("#")[1];

    window.requestAnimationFrame(() => {
      document
        .getElementById(hash)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });

    return;
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });
}

export function TransicaoPagina({
  children,
}: TransicaoPaginaProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [fase, setFase] =
    useState<FaseTransicao>("pronta");

  const destinoRef =
    useRef<To | null>(null);

  const chaveOrigemRef =
    useRef(location.key);

  const navegar =
    useCallback(
      (destino: To) => {
        if (
          fase !== "pronta"
        ) {
          return;
        }

        if (
          prefereMovimentoReduzido()
        ) {
          navigate(destino);
          rolarAposNavegacao(
            destino,
          );
          return;
        }

        destinoRef.current =
          destino;

        chaveOrigemRef.current =
          location.key;

        setFase("saindo");
      },
      [
        fase,
        location.key,
        navigate,
      ],
    );

  useEffect(() => {
    if (fase !== "saindo") {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setFase("interludio");
      }, DURACAO_SAIDA);

    return () =>
      window.clearTimeout(timer);
  }, [fase]);

  useEffect(() => {
    if (
      fase !== "interludio" ||
      destinoRef.current === null
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        navigate(
          destinoRef.current!,
        );
      }, DURACAO_INTERLUDIO);

    return () =>
      window.clearTimeout(timer);
  }, [
    fase,
    navigate,
  ]);

  useEffect(() => {
    if (
      fase !== "interludio" ||
      location.key ===
        chaveOrigemRef.current
    ) {
      return;
    }

    const destino =
      destinoRef.current;

    if (destino !== null) {
      rolarAposNavegacao(
        destino,
      );
    }

    destinoRef.current = null;

    window.requestAnimationFrame(
      () => {
        setFase("entrando");
      },
    );
  }, [
    fase,
    location.key,
  ]);

  useEffect(() => {
    if (fase !== "entrando") {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setFase("pronta");
      }, DURACAO_ENTRADA);

    return () =>
      window.clearTimeout(timer);
  }, [fase]);

  useEffect(() => {
    const bloqueada =
      fase !== "pronta";

    document.body.classList.toggle(
      "pagina-em-transicao",
      bloqueada,
    );

    return () => {
      document.body.classList.remove(
        "pagina-em-transicao",
      );
    };
  }, [fase]);

  const valorContexto =
    useMemo<ContextoTransicao>(
      () => ({
        fase,
        navegando:
          fase !== "pronta",
        navegar,
      }),
      [
        fase,
        navegar,
      ],
    );

  return (
    <Contexto.Provider
      value={valorContexto}
    >
      <div
        className={[
          "transicao-pagina",
          `transicao-pagina--${fase}`,
        ].join(" ")}
      >
        <div className="transicao-pagina__conteudo">
          {children}
        </div>

        <div
          className="transicao-pagina__interludio"
          aria-hidden={
            fase === "pronta"
          }
        >
          <div className="transicao-pagina__marca">
            <span
              className="transicao-pagina__simbolo"
              aria-hidden="true"
            >
              ❦
            </span>

            <strong>
              Casados &amp; Enrolados
            </strong>

            <span className="transicao-pagina__legenda">
              virando a página
            </span>
          </div>
        </div>
      </div>
    </Contexto.Provider>
  );
}

export function useTransicaoPagina() {
  const contexto =
    useContext(Contexto);

  if (!contexto) {
    throw new Error(
      "useTransicaoPagina precisa estar dentro de <TransicaoPagina>.",
    );
  }

  return contexto;
}

function deveInterceptarClique(
  evento: MouseEvent<HTMLAnchorElement>,
  target?: string,
) {
  return (
    evento.button === 0 &&
    !evento.metaKey &&
    !evento.ctrlKey &&
    !evento.shiftKey &&
    !evento.altKey &&
    target !== "_blank"
  );
}

export function LinkTransicao({
  onClick,
  target,
  to,
  ...props
}: LinkProps) {
  const { navegar } =
    useTransicaoPagina();

  function lidarComClique(
    evento: MouseEvent<HTMLAnchorElement>,
  ) {
    onClick?.(evento);

    if (
      evento.defaultPrevented ||
      !deveInterceptarClique(
        evento,
        target,
      )
    ) {
      return;
    }

    evento.preventDefault();
    navegar(to);
  }

  return (
    <Link
      {...props}
      to={to}
      target={target}
      onClick={lidarComClique}
    />
  );
}

export function NavLinkTransicao({
  onClick,
  target,
  to,
  ...props
}: NavLinkProps) {
  const { navegar } =
    useTransicaoPagina();

  function lidarComClique(
    evento: MouseEvent<HTMLAnchorElement>,
  ) {
    onClick?.(evento);

    if (
      evento.defaultPrevented ||
      !deveInterceptarClique(
        evento,
        target,
      )
    ) {
      return;
    }

    evento.preventDefault();
    navegar(to);
  }

  return (
    <NavLink
      {...props}
      to={to}
      target={target}
      onClick={lidarComClique}
    />
  );
}
