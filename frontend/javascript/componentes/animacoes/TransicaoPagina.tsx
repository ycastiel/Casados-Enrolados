import {
  createContext,
  type CSSProperties,
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

import ramoFloral from "../../../recursos/imagens/ramo-floral.svg";

import "../../../css/componentes/animacoes/transicaoPagina.css";

type FaseTransicao =
  | "pronta"
  | "saindo"
  | "formando"
  | "trocando"
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

// Estes três tempos são os principais pontos de ajuste da animação.
const DURACAO_SAIDA = 430;
const DURACAO_FORMACAO_COROA = 1120;
const DURACAO_ENTRADA = 560;

const QUANTIDADE_RAMOS = 8;

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
    behavior: "auto",
  });
}

function destinoEhSecaoDaPaginaAtual(
  destino: To,
  pathnameAtual: string,
) {
  if (
    typeof destino !== "string" ||
    !destino.includes("#")
  ) {
    return false;
  }

  const [pathnameDestino] =
    destino.split("#");

  const pathnameNormalizado =
    pathnameDestino ||
    pathnameAtual;

  return (
    pathnameNormalizado ===
    pathnameAtual
  );
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

        // Âncoras na mesma página usam apenas scroll suave.
        if (
          destinoEhSecaoDaPaginaAtual(
            destino,
            location.pathname,
          )
        ) {
          navigate(destino);
          rolarAposNavegacao(
            destino,
          );
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
        location.pathname,
        navigate,
      ],
    );

  // 1) A página atual se afasta e perde foco.
  useEffect(() => {
    if (fase !== "saindo") {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setFase("formando");
      }, DURACAO_SAIDA);

    return () =>
      window.clearTimeout(timer);
  }, [fase]);

  // 2) A coroa se completa.
  // Só depois disso trocamos a rota.
  useEffect(() => {
    if (
      fase !== "formando" ||
      destinoRef.current === null
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setFase("trocando");

        navigate(
          destinoRef.current!,
        );
      }, DURACAO_FORMACAO_COROA);

    return () =>
      window.clearTimeout(timer);
  }, [
    fase,
    navigate,
  ]);

  // 3) O React Router confirmou a nova página.
  useEffect(() => {
    if (
      fase !== "trocando" ||
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

  // 4) A página nova aproxima até a escala normal.
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
          <div className="transicao-pagina__coroa">
            <div className="transicao-pagina__coroa-ramos">
              {Array.from(
                {
                  length:
                    QUANTIDADE_RAMOS,
                },
                (_, indice) => (
                  <span
                    className="transicao-pagina__ramo"
                    key={indice}
                    style={
                      {
                        "--indice-ramo":
                          indice,
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  >
                    <img
                      src={ramoFloral}
                      alt=""
                      draggable="false"
                    />
                  </span>
                ),
              )}
            </div>

            <div className="transicao-pagina__medalhao">
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
