import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  OrnamentoFloral,
  RamoFloral,
} from "../../componentes/molduras/Floral";

import type {
  DadosCasamento,
  EventoCasamento,
} from "../../paginas/eventos/Casamento";

import "../../../css/componentes/animacoes/contagemRegressiva.css";

type VarianteContagemRegressiva =
  | "principal"
  | "compacta";

type ContagemRegressivaProps = {
  casamento: DadosCasamento["casamento"];
  eventos: EventoCasamento[];
  variante?: VarianteContagemRegressiva;
};

type OrigemAlvo =
  | "cerimonia"
  | "data-casamento";

type AlvoContagem = {
  data: Date;
  origem: OrigemAlvo;
};

type PartesContagem = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

function encontrarCerimonia(
  eventos: EventoCasamento[],
): EventoCasamento | null {
  const cerimonias = eventos
    .filter(
      (evento) =>
        evento.tipo === "CERIMONIA",
    )
    .filter(
      (evento) =>
        !Number.isNaN(
          new Date(
            evento.inicioEm,
          ).getTime(),
        ),
    )
    .sort(
      (eventoA, eventoB) =>
        new Date(
          eventoA.inicioEm,
        ).getTime() -
        new Date(
          eventoB.inicioEm,
        ).getTime(),
    );

  return cerimonias[0] ?? null;
}

function extrairPartesDataNoFuso(
  data: Date,
  fusoHorario: string,
) {
  const formatador =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: fusoHorario,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      },
    );

  const partes =
    formatador.formatToParts(
      data,
    );

  const valor = (
    tipo: Intl.DateTimeFormatPartTypes,
  ) =>
    Number(
      partes.find(
        (parte) =>
          parte.type === tipo,
      )?.value ?? 0,
    );

  return {
    ano: valor("year"),
    mes: valor("month"),
    dia: valor("day"),
    hora: valor("hour"),
    minuto: valor("minute"),
    segundo: valor("second"),
  };
}

function criarInicioDoDiaNoFuso(
  dataCasamento: string,
  fusoHorario: string,
): Date {
  const somenteData =
    dataCasamento.slice(0, 10);

  const [
    ano,
    mes,
    dia,
  ] = somenteData
    .split("-")
    .map(Number);

  if (
    !ano ||
    !mes ||
    !dia
  ) {
    return new Date(
      dataCasamento,
    );
  }

  const meiaNoiteComoUtc =
    Date.UTC(
      ano,
      mes - 1,
      dia,
      0,
      0,
      0,
    );

  try {
    let instante =
      meiaNoiteComoUtc;

    for (
      let tentativa = 0;
      tentativa < 2;
      tentativa += 1
    ) {
      const partes =
        extrairPartesDataNoFuso(
          new Date(
            instante,
          ),
          fusoHorario,
        );

      const representacaoLocalComoUtc =
        Date.UTC(
          partes.ano,
          partes.mes - 1,
          partes.dia,
          partes.hora,
          partes.minuto,
          partes.segundo,
        );

      const deslocamento =
        representacaoLocalComoUtc -
        instante;

      instante =
        meiaNoiteComoUtc -
        deslocamento;
    }

    return new Date(instante);
  } catch {
    return new Date(
      `${somenteData}T00:00:00`,
    );
  }
}

function definirAlvo(
  casamento: DadosCasamento["casamento"],
  eventos: EventoCasamento[],
): AlvoContagem {
  const cerimonia =
    encontrarCerimonia(
      eventos,
    );

  if (cerimonia) {
    return {
      data: new Date(
        cerimonia.inicioEm,
      ),
      origem: "cerimonia",
    };
  }

  return {
    data: criarInicioDoDiaNoFuso(
      casamento.dataCasamento,
      casamento.fusoHorario,
    ),
    origem: "data-casamento",
  };
}

function calcularContagem(
  agora: Date,
  alvo: Date,
): PartesContagem {
  const diferenca =
    Math.max(
      0,
      alvo.getTime() -
        agora.getTime(),
    );

  return {
    dias: Math.floor(
      diferenca / DIA,
    ),
    horas: Math.floor(
      (diferenca % DIA) /
        HORA,
    ),
    minutos: Math.floor(
      (diferenca % HORA) /
        MINUTO,
    ),
    segundos: Math.floor(
      (diferenca % MINUTO) /
        SEGUNDO,
    ),
  };
}

function chaveDiaNoFuso(
  data: Date,
  fusoHorario: string,
): string {
  try {
    const partes =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: fusoHorario,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      ).formatToParts(data);

    const valor = (
      tipo:
        | "year"
        | "month"
        | "day",
    ) =>
      partes.find(
        (parte) =>
          parte.type === tipo,
      )?.value ?? "";

    return [
      valor("year"),
      valor("month"),
      valor("day"),
    ].join("-");
  } catch {
    return [
      data.getFullYear(),
      String(
        data.getMonth() + 1,
      ).padStart(2, "0"),
      String(
        data.getDate(),
      ).padStart(2, "0"),
    ].join("-");
  }
}

function formatarNumero(
  valor: number,
): string {
  return String(
    valor,
  ).padStart(2, "0");
}

export function ContagemRegressiva({
  casamento,
  eventos,
  variante = "principal",
}: ContagemRegressivaProps) {
  const [agora, setAgora] =
    useState(
      () => new Date(),
    );

  const alvo =
    useMemo(
      () =>
        definirAlvo(
          casamento,
          eventos,
        ),
      [
        casamento,
        eventos,
      ],
    );

  useEffect(() => {
    const atualizar = () => {
      setAgora(
        new Date(),
      );
    };

    atualizar();

    const intervalo =
      window.setInterval(
        atualizar,
        SEGUNDO,
      );

    return () => {
      window.clearInterval(
        intervalo,
      );
    };
  }, []);

  const contagem =
    calcularContagem(
      agora,
      alvo.data,
    );

  const diaAtual =
    chaveDiaNoFuso(
      agora,
      casamento.fusoHorario,
    );

  const diaCasamento =
    chaveDiaNoFuso(
      alvo.data,
      casamento.fusoHorario,
    );

  const ehHoje =
    diaAtual === diaCasamento;

  const alvoJaPassou =
    agora.getTime() >=
    alvo.data.getTime();

  const casamentoJaPassou =
    diaAtual > diaCasamento;

  const titulo =
    casamentoJaPassou
      ? "Esse capítulo já começou."
      : ehHoje
        ? "É hoje. 💛"
        : "Até o nosso grande dia";

  const subtitulo =
    casamentoJaPassou
      ? "Que essa nova história venha cheia de capítulos bonitos."
      : alvoJaPassou
        ? "O grande dia chegou."
        : alvo.origem ===
            "cerimonia"
          ? "Contando cada instante até a cerimônia."
          : "Contando cada instante até o casamento.";

  const unidades = [
    {
      chave: "dias",
      valor:
        contagem.dias,
      rotulo: "dias",
    },
    {
      chave: "horas",
      valor:
        contagem.horas,
      rotulo: "horas",
    },
    {
      chave: "minutos",
      valor:
        contagem.minutos,
      rotulo: "minutos",
    },
    {
      chave: "segundos",
      valor:
        contagem.segundos,
      rotulo: "segundos",
    },
  ] as const;

  const mostrarNumeros =
    !casamentoJaPassou &&
    !alvoJaPassou;

  return (
    <section
      className={[
        "contagem-regressiva",
        `contagem-regressiva--${variante}`,
        ehHoje
          ? "contagem-regressiva--hoje"
          : "",
        casamentoJaPassou
          ? "contagem-regressiva--concluida"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="titulo-contagem-regressiva"
    >
      <RamoFloral className="contagem-regressiva__ramo contagem-regressiva__ramo--esquerda" />
      <RamoFloral className="contagem-regressiva__ramo contagem-regressiva__ramo--direita" />

      <div className="contagem-regressiva__papel">
        <span className="contagem-regressiva__etiqueta">
          Falta pouco
        </span>

        <h2
          id="titulo-contagem-regressiva"
          className="contagem-regressiva__titulo"
        >
          {titulo}
        </h2>

        <OrnamentoFloral
          compacto
          className="contagem-regressiva__ornamento"
        />

        {mostrarNumeros && (
          <div
            className="contagem-regressiva__numeros"
            role="timer"
            aria-label={[
              `Faltam ${contagem.dias} dias`,
              `${contagem.horas} horas`,
              `${contagem.minutos} minutos`,
              `e ${contagem.segundos} segundos`,
            ].join(", ")}
          >
            {unidades.map(
              (
                unidade,
                indice,
              ) => (
                <div
                  className="contagem-regressiva__grupo"
                  key={
                    unidade.chave
                  }
                >
                  <div className="contagem-regressiva__unidade">
                    <span
                      className="contagem-regressiva__valor"
                      key={`${unidade.chave}-${unidade.valor}`}
                      aria-hidden="true"
                    >
                      {formatarNumero(
                        unidade.valor,
                      )}
                    </span>

                    <span className="contagem-regressiva__rotulo">
                      {
                        unidade.rotulo
                      }
                    </span>
                  </div>

                  {indice <
                    unidades.length -
                      1 && (
                    <span
                      className="contagem-regressiva__separador"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        )}

        {!mostrarNumeros && (
          <div
            className="contagem-regressiva__marco"
            aria-hidden="true"
          >
            ❦
          </div>
        )}

        <p className="contagem-regressiva__mensagem">
          {subtitulo}
        </p>
      </div>
    </section>
  );
}
