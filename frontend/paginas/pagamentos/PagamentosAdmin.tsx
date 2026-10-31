import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  confirmarPagamentoManualAdmin,
  listarPagamentosAdmin,
  type PagamentoAdmin,
  type StatusPagamentoAdmin,
} from "../../javascript/paginas/pagamentos/PagamentosAdmin";

import {
  OrnamentoFloral,
} from "../../javascript/componentes/molduras/Floral";

import "../../css/paginas/pagamentos/pagamentosAdmin.css";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function rotuloStatus(status: StatusPagamentoAdmin) {
  const rotulos: Record<StatusPagamentoAdmin, string> = {
    PENDENTE: "Pendente",
    PROCESSANDO: "Processando",
    APROVADO: "Aprovado",
    RECUSADO: "Recusado",
    CANCELADO: "Cancelado",
    ESTORNADO: "Estornado",
    EXPIRADO: "Expirado",
  };
  return rotulos[status];
}

export function PagamentosAdmin() {
  const [pagamentos, setPagamentos] =
    useState<PagamentoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] =
    useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setCarregando(true);
      setErro(null);
      setPagamentos(await listarPagamentosAdmin());
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível carregar os pagamentos.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const resumo = useMemo(() => ({
    total: pagamentos.length,
    pendentes: pagamentos.filter(
      (p) => p.status === "PENDENTE" || p.status === "PROCESSANDO",
    ).length,
    aprovados: pagamentos.filter((p) => p.status === "APROVADO").length,
    valorAprovado: pagamentos
      .filter((p) => p.status === "APROVADO")
      .reduce((total, p) => total + Number(p.valor), 0),
  }), [pagamentos]);

  async function confirmar(pagamento: PagamentoAdmin) {
    const confirmou = window.confirm(
      `Confirmar manualmente o pagamento de ${pagamento.reserva.nomeResponsavel}?`,
    );
    if (!confirmou) return;

    try {
      setProcessando(pagamento.id);
      setErro(null);
      const atualizado =
        await confirmarPagamentoManualAdmin(pagamento.id);
      setPagamentos((atuais) =>
        atuais.map((item) =>
          item.id === atualizado.id ? atualizado : item,
        ),
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível confirmar o pagamento.",
      );
    } finally {
      setProcessando(null);
    }
  }

  return (
    <div className="pagamentos-admin">
      <header className="pagamentos-admin-cabecalho">
        <div>
          <span className="secao-etiqueta">
            Presentes e contribuições
          </span>
          <h1>Pagamentos</h1>
          <OrnamentoFloral compacto />
          <p>
            Acompanhe os pagamentos dos presentes. Pix do Mercado Pago
            é conciliado automaticamente; a confirmação manual continua
            disponível apenas como apoio no desenvolvimento.
          </p>
        </div>
      </header>

      <section className="pagamentos-admin-resumo" aria-label="Resumo dos pagamentos">
        <article>
          <span>Registros</span>
          <strong>{resumo.total}</strong>
          <small>tentativas criadas</small>
        </article>
        <article>
          <span>Aguardando</span>
          <strong>{resumo.pendentes}</strong>
          <small>pendentes ou processando</small>
        </article>
        <article>
          <span>Confirmados</span>
          <strong>{resumo.aprovados}</strong>
          <small>reservas concluídas</small>
        </article>
        <article>
          <span>Recebido</span>
          <strong>{moeda.format(resumo.valorAprovado)}</strong>
          <small>somente aprovados</small>
        </article>
      </section>

      {erro ? (
        <div className="pagamentos-admin-aviso">
          <span>{erro}</span>
          <button type="button" onClick={() => void carregar()}>Tentar novamente</button>
        </div>
      ) : null}

      <section className="pagamentos-admin-lista" aria-label="Lista de pagamentos">
        {carregando ? (
          <div className="pagamentos-admin-vazio">Carregando pagamentos…</div>
        ) : pagamentos.length === 0 ? (
          <div className="pagamentos-admin-vazio">
            <span aria-hidden="true">❦</span>
            <h2>Ainda não há pagamentos.</h2>
            <p>Quando uma reserva iniciar o fluxo de pagamento, ela aparecerá aqui.</p>
          </div>
        ) : (
          pagamentos.map((pagamento) => (
            <article className="pagamento-admin-card" key={pagamento.id}>
              <div className="pagamento-admin-imagem">
                {pagamento.reserva.presente.imagemUrl ? (
                  <img src={pagamento.reserva.presente.imagemUrl} alt="" />
                ) : (
                  <span aria-hidden="true">♡</span>
                )}
              </div>

              <div className="pagamento-admin-info">
                <div className="pagamento-admin-topo">
                  <div>
                    <span className="pagamento-admin-presente">
                      {pagamento.reserva.presente.nome}
                    </span>
                    <h2>{pagamento.reserva.nomeResponsavel}</h2>
                  </div>
                  <span className={`pagamento-admin-status pagamento-admin-status--${pagamento.status.toLowerCase()}`}>
                    {rotuloStatus(pagamento.status)}
                  </span>
                </div>

                <div className="pagamento-admin-detalhes">
                  <span><small>Valor</small><strong>{moeda.format(Number(pagamento.valor))}</strong></span>
                  <span><small>Quantidade</small><strong>{pagamento.reserva.quantidade}</strong></span>
                  <span><small>Provedor</small><strong>{pagamento.provedor === "MERCADO_PAGO" ? "Mercado Pago" : pagamento.provedor}</strong></span>
                  <span><small>Criado</small><strong>{dataHora.format(new Date(pagamento.criadoEm))}</strong></span>
                </div>
              </div>

              <div className="pagamento-admin-acoes">
                {(pagamento.status === "PENDENTE" || pagamento.status === "PROCESSANDO") ? (
                  <button
                    type="button"
                    onClick={() => void confirmar(pagamento)}
                    disabled={processando === pagamento.id}
                  >
                    {processando === pagamento.id ? "Confirmando…" : "Confirmar manualmente"}
                  </button>
                ) : (
                  <span className="pagamento-admin-concluido">
                    {pagamento.status === "APROVADO" ? "Reserva concluída" : "Sem ação disponível"}
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
