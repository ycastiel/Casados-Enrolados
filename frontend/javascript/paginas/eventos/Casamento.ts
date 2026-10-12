import {
  useCallback,
  useEffect,
  useState,
} from "react";

export type TipoEvento =
  | "CERIMONIA"
  | "RECEPCAO"
  | "FESTA"
  | "OUTRO";

export type TipoPresente =
  | "PRODUTO"
  | "COTA";

export type EventoCasamento = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TipoEvento;
  inicioEm: string;
  fimEm: string | null;
  local: string | null;
  endereco: string | null;
  urlMapa: string | null;
  exigeConfirmacao: boolean;
};

export type PresenteCasamento = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TipoPresente;
  valorUnitario: string | null;
  imagemUrl: string | null;
  urlExterna: string | null;
  quantidadeTotal: number;
  quantidadeReservada: number;
  quantidadeDisponivel: number;
};

export type DadosCasamento = {
  casamento: {
    id: string;
    slug: string;
    nomePessoa1: string;
    nomePessoa2: string;
    titulo: string | null;
    descricao: string | null;
    dataCasamento: string;
    fusoHorario: string;
  };

  eventos: EventoCasamento[];
  presentes: PresenteCasamento[];
};

type RespostaCasamento = {
  dados: DadosCasamento;
};

type RespostaErro = {
  erro?: {
    codigo?: string;
    mensagem?: string;
  };
};

async function extrairMensagemErro(
  resposta: Response,
): Promise<string> {
  const tipoConteudo =
    resposta.headers.get("content-type") ?? "";

  if (!tipoConteudo.includes("application/json")) {
    return (
      "A API não retornou JSON. Verifique se o backend está rodando " +
      "e se o proxy do Vite está ativo."
    );
  }

  try {
    const corpo = (await resposta.json()) as RespostaErro;

    if (corpo.erro?.mensagem) {
      return corpo.erro.mensagem;
    }
  } catch {
    // Mantém a mensagem amigável abaixo.
  }

  return "Não foi possível carregar os dados do casamento.";
}

export async function buscarCasamento(
  signal?: AbortSignal,
): Promise<DadosCasamento> {
  const resposta = await fetch("/api/casamento", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  const tipoConteudo =
    resposta.headers.get("content-type") ?? "";

  if (!resposta.ok) {
    const mensagem = await extrairMensagemErro(resposta);

    throw new Error(mensagem);
  }

  if (!tipoConteudo.includes("application/json")) {
    throw new Error(
      "A API não retornou JSON. Verifique se o backend está rodando e se o proxy do Vite está ativo.",
    );
  }

  const corpo = (await resposta.json()) as RespostaCasamento;

  return corpo.dados;
}

export function useCasamento() {
  const [dados, setDados] =
    useState<DadosCasamento | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  const [tentativa, setTentativa] =
    useState(0);

  const recarregar = useCallback(() => {
    setTentativa((valorAtual) => valorAtual + 1);
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    let ativo = true;

    setCarregando(true);
    setErro(null);

    buscarCasamento(controlador.signal)
      .then((resultado) => {
        if (!ativo) {
          return;
        }

        setDados(resultado);
      })
      .catch((erroCapturado: unknown) => {
        if (!ativo) {
          return;
        }

        if (
          erroCapturado instanceof DOMException &&
          erroCapturado.name === "AbortError"
        ) {
          return;
        }

        setErro(
          erroCapturado instanceof Error
            ? erroCapturado.message
            : "Não foi possível carregar os dados do casamento.",
        );
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
      controlador.abort();
    };
  }, [tentativa]);

  return {
    dados,
    carregando,
    erro,
    recarregar,
  };
}
