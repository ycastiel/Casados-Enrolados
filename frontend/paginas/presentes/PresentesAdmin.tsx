import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  atualizarPresenteAdmin,
  criarPresenteAdmin,
  desativarPresenteAdmin,
  enviarImagemPresenteAdmin,
  listarPresentesAdmin,
  removerImagemPresenteAdmin,
  type PresenteAdmin,
  type TipoPresenteAdmin,
} from "../../javascript/paginas/presentes/PresentesAdmin";

import {
  OrnamentoFloral,
} from "../../javascript/componentes/molduras/Floral";

import "../../css/paginas/presentes/presentesAdmin.css";

type FiltroStatus =
  | "TODOS"
  | "DISPONIVEIS"
  | "RESERVADOS"
  | "ESGOTADOS"
  | "INATIVOS";

type FormularioPresente = {
  nome: string;
  descricao: string;
  tipo: TipoPresenteAdmin;
  valorUnitario: string;
  imagemUrl: string;
  urlExterna: string;
  quantidadeTotal: string;
  ordem: string;
  ativo: boolean;
};

const formularioVazio: FormularioPresente = {
  nome: "",
  descricao: "",
  tipo: "PRODUTO",
  valorUnitario: "",
  imagemUrl: "",
  urlExterna: "",
  quantidadeTotal: "1",
  ordem: "0",
  ativo: true,
};

const formatadorMoeda =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );

function formatarValor(
  presente: PresenteAdmin,
) {
  if (
    presente.valorUnitario === null
  ) {
    return "Valor livre";
  }

  return formatadorMoeda.format(
    Number(presente.valorUnitario),
  );
}

function formularioDoPresente(
  presente: PresenteAdmin,
): FormularioPresente {
  return {
    nome: presente.nome,
    descricao:
      presente.descricao ?? "",
    tipo: presente.tipo,
    valorUnitario:
      presente.valorUnitario ?? "",
    imagemUrl:
      presente.imagemUrl ?? "",
    urlExterna:
      presente.urlExterna ?? "",
    quantidadeTotal:
      String(presente.quantidadeTotal),
    ordem: String(presente.ordem),
    ativo: presente.ativo,
  };
}

function ordenarPresentes(
  presentes: PresenteAdmin[],
) {
  return [...presentes].sort(
    (a, b) =>
      Number(b.ativo) -
        Number(a.ativo) ||
      a.ordem - b.ordem ||
      a.nome.localeCompare(
        b.nome,
        "pt-BR",
      ),
  );
}

function rotuloStatus(
  presente: PresenteAdmin,
) {
  if (!presente.ativo) {
    return {
      texto: "Inativo",
      classe:
        "presente-admin-status presente-admin-status--inativo",
    };
  }

  if (
    presente.quantidadeDisponivel === 0
  ) {
    return {
      texto: "Esgotado",
      classe:
        "presente-admin-status presente-admin-status--esgotado",
    };
  }

  if (
    presente.quantidadeReservada > 0
  ) {
    return {
      texto: "Reservado",
      classe:
        "presente-admin-status presente-admin-status--reservado",
    };
  }

  return {
    texto: "Disponível",
    classe:
      "presente-admin-status presente-admin-status--disponivel",
  };
}

export function PresentesAdmin() {
  const [presentes, setPresentes] =
    useState<PresenteAdmin[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [busca, setBusca] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("TODOS");

  const [formularioAberto, setFormularioAberto] =
    useState(false);

  const [presenteEditando, setPresenteEditando] =
    useState<string | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioPresente>(
      formularioVazio,
    );

  const [arquivoImagem, setArquivoImagem] =
    useState<File | null>(null);

  const [previewImagem, setPreviewImagem] =
    useState<string | null>(null);

  async function carregarPresentes() {
    try {
      setCarregando(true);
      setErro(null);

      const resultado =
        await listarPresentesAdmin();

      setPresentes(
        ordenarPresentes(resultado),
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível carregar os presentes.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarPresentes();
  }, []);


  useEffect(() => {
    return () => {
      if (
        previewImagem?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          previewImagem,
        );
      }
    };
  }, [previewImagem]);

  const resumo = useMemo(
    () => ({
      total: presentes.length,

      disponiveis:
        presentes.filter(
          (presente) =>
            presente.ativo &&
            presente.quantidadeDisponivel > 0,
        ).length,

      reservados:
        presentes.filter(
          (presente) =>
            presente.ativo &&
            presente.quantidadeReservada > 0,
        ).length,

      inativos:
        presentes.filter(
          (presente) =>
            !presente.ativo,
        ).length,
    }),
    [presentes],
  );

  const presentesFiltrados =
    useMemo(() => {
      const termo = busca
        .trim()
        .toLocaleLowerCase("pt-BR");

      return presentes.filter(
        (presente) => {
          const correspondeBusca =
            termo.length === 0 ||
            presente.nome
              .toLocaleLowerCase("pt-BR")
              .includes(termo) ||
            presente.descricao
              ?.toLocaleLowerCase("pt-BR")
              .includes(termo) === true;

          const correspondeStatus =
            filtroStatus === "TODOS" ||
            (
              filtroStatus === "DISPONIVEIS" &&
              presente.ativo &&
              presente.quantidadeDisponivel > 0
            ) ||
            (
              filtroStatus === "RESERVADOS" &&
              presente.ativo &&
              presente.quantidadeReservada > 0
            ) ||
            (
              filtroStatus === "ESGOTADOS" &&
              presente.ativo &&
              presente.quantidadeDisponivel === 0
            ) ||
            (
              filtroStatus === "INATIVOS" &&
              !presente.ativo
            );

          return (
            correspondeBusca &&
            correspondeStatus
          );
        },
      );
    }, [
      busca,
      filtroStatus,
      presentes,
    ]);

  function limparImagemSelecionada() {
    setArquivoImagem(null);
    setPreviewImagem(null);
  }

  function selecionarImagem(
    arquivo: File | null,
  ) {
    if (!arquivo) {
      limparImagemSelecionada();
      return;
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !tiposPermitidos.includes(
        arquivo.type,
      )
    ) {
      setErro(
        "Escolha uma imagem JPEG, PNG ou WebP.",
      );
      return;
    }

    if (
      arquivo.size >
      5 * 1024 * 1024
    ) {
      setErro(
        "A imagem pode ter no máximo 5 MB.",
      );
      return;
    }

    setErro(null);
    setArquivoImagem(arquivo);
    setPreviewImagem(
      URL.createObjectURL(arquivo),
    );
  }

  function removerImagemFormulario() {
    limparImagemSelecionada();

    setFormulario((atual) => ({
      ...atual,
      imagemUrl: "",
    }));
  }

  function abrirNovoPresente() {
    setPresenteEditando(null);
    limparImagemSelecionada();
    setFormulario(formularioVazio);
    setErro(null);
    setFormularioAberto(true);
  }

  function abrirEdicao(
    presente: PresenteAdmin,
  ) {
    setPresenteEditando(
      presente.id,
    );

    limparImagemSelecionada();

    setFormulario(
      formularioDoPresente(
        presente,
      ),
    );

    setErro(null);
    setFormularioAberto(true);
  }

  function fecharFormulario() {
    if (salvando) {
      return;
    }

    setFormularioAberto(false);
    setPresenteEditando(null);
    limparImagemSelecionada();
    setFormulario(formularioVazio);
    setErro(null);
  }

  async function salvarPresente(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    const quantidadeTotal =
      Number(formulario.quantidadeTotal);

    const ordem =
      Number(formulario.ordem);

    const valorUnitario =
      formulario.valorUnitario.trim()
        ? Number(
            formulario.valorUnitario.replace(
              ",",
              ".",
            ),
          )
        : null;

    if (
      !Number.isInteger(quantidadeTotal) ||
      quantidadeTotal < 1
    ) {
      setErro(
        "A quantidade total deve ser um número inteiro maior que zero.",
      );
      return;
    }

    if (
      !Number.isInteger(ordem) ||
      ordem < 0
    ) {
      setErro(
        "A ordem deve ser um número inteiro maior ou igual a zero.",
      );
      return;
    }

    if (
      valorUnitario !== null &&
      (
        !Number.isFinite(valorUnitario) ||
        valorUnitario <= 0
      )
    ) {
      setErro(
        "Informe um valor válido ou deixe o campo vazio.",
      );
      return;
    }

    let imagemEnviadaNestaTentativa:
      string | null = null;

    try {
      setSalvando(true);
      setErro(null);

      const presenteAnterior =
        presenteEditando
          ? presentes.find(
              (presente) =>
                presente.id === presenteEditando,
            ) ?? null
          : null;

      const imagemAnterior =
        presenteAnterior?.imagemUrl ?? null;

      let imagemUrlFinal =
        formulario.imagemUrl || null;

      if (arquivoImagem) {
        const imagemEnviada =
          await enviarImagemPresenteAdmin(
            arquivoImagem,
          );

        imagemEnviadaNestaTentativa =
          imagemEnviada.url;

        imagemUrlFinal =
          imagemEnviada.url;
      }

      const dados = {
        nome: formulario.nome,
        descricao:
          formulario.descricao || null,
        tipo: formulario.tipo,
        valorUnitario,
        imagemUrl:
          imagemUrlFinal,
        urlExterna:
          formulario.urlExterna || null,
        quantidadeTotal,
        ativo: formulario.ativo,
        ordem,
      };

      const salvo =
        presenteEditando
          ? await atualizarPresenteAdmin(
              presenteEditando,
              dados,
            )
          : await criarPresenteAdmin(
              dados,
            );

      setPresentes((atuais) =>
        ordenarPresentes(
          presenteEditando
            ? atuais.map(
                (presente) =>
                  presente.id === salvo.id
                    ? salvo
                    : presente,
              )
            : [
                ...atuais,
                salvo,
              ],
        ),
      );

      /*
       * Se uma imagem local antiga foi substituída/removida,
       * limpamos o arquivo depois que o presente já foi salvo.
       */
      if (
        imagemAnterior &&
        imagemAnterior !== imagemUrlFinal &&
        imagemAnterior.startsWith(
          "/api/uploads/presentes/",
        )
      ) {
        try {
          await removerImagemPresenteAdmin(
            imagemAnterior,
          );
        } catch {
          // A alteração principal já foi concluída; não bloqueamos
          // o admin por uma falha de limpeza do arquivo antigo.
        }
      }

      setFormularioAberto(false);
      setPresenteEditando(null);
      limparImagemSelecionada();
      setFormulario(formularioVazio);
    } catch (erroCapturado) {
      /*
       * Se o upload funcionou mas o POST/PATCH do presente falhou,
       * evitamos deixar um arquivo órfão no servidor.
       */
      if (imagemEnviadaNestaTentativa) {
        try {
          await removerImagemPresenteAdmin(
            imagemEnviadaNestaTentativa,
          );
        } catch {
          // A mensagem original do salvamento é mais importante.
        }
      }

      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível salvar o presente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarAtivo(
    presente: PresenteAdmin,
  ) {
    if (presente.ativo) {
      const confirmado =
        window.confirm(
          `Desativar “${presente.nome}”? Ele deixará de aparecer na lista pública, mas as reservas continuarão preservadas.`,
        );

      if (!confirmado) {
        return;
      }
    }

    try {
      setSalvando(true);
      setErro(null);

      if (presente.ativo) {
        await desativarPresenteAdmin(
          presente.id,
        );

        setPresentes((atuais) =>
          ordenarPresentes(
            atuais.map((item) =>
              item.id === presente.id
                ? {
                    ...item,
                    ativo: false,
                  }
                : item,
            ),
          ),
        );
      } else {
        const atualizado =
          await atualizarPresenteAdmin(
            presente.id,
            {
              ativo: true,
            },
          );

        setPresentes((atuais) =>
          ordenarPresentes(
            atuais.map((item) =>
              item.id === presente.id
                ? atualizado
                : item,
            ),
          ),
        );
      }
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível alterar o presente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="presentes-admin">
      <header className="presentes-admin-cabecalho">
        <div>
          <span className="secao-etiqueta">
            Lista do casal
          </span>

          <h1>
            Presentes
          </h1>

          <p>
            Cadastre os itens que aparecem no site, acompanhe
            disponibilidade e veja reservas ativas sem transformar
            o casamento em painel de estoque de supermercado.
          </p>
        </div>

        <button
          className="botao botao--primario"
          type="button"
          onClick={abrirNovoPresente}
        >
          + Novo presente
        </button>
      </header>

      <section
        className="presentes-admin-resumo"
        aria-label="Resumo da lista de presentes"
      >
        <article>
          <span>Total</span>
          <strong>{resumo.total}</strong>
          <small>itens cadastrados</small>
        </article>

        <article>
          <span>Disponíveis</span>
          <strong>{resumo.disponiveis}</strong>
          <small>com unidades livres</small>
        </article>

        <article>
          <span>Reservados</span>
          <strong>{resumo.reservados}</strong>
          <small>com reserva ativa</small>
        </article>

        <article>
          <span>Inativos</span>
          <strong>{resumo.inativos}</strong>
          <small>fora do site público</small>
        </article>
      </section>

      {erro && (
        <div
          className="presentes-admin-aviso presentes-admin-aviso--erro"
          role="alert"
        >
          <span>{erro}</span>

          {!formularioAberto && (
            <button
              type="button"
              onClick={() => {
                void carregarPresentes();
              }}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      <section className="presentes-admin-painel">
        <div className="presentes-admin-filtros">
          <label>
            <span>Buscar</span>

            <input
              type="search"
              value={busca}
              placeholder="Nome ou descrição"
              onChange={(evento) =>
                setBusca(
                  evento.target.value,
                )
              }
            />
          </label>

          <label>
            <span>Status</span>

            <select
              value={filtroStatus}
              onChange={(evento) =>
                setFiltroStatus(
                  evento.target.value as FiltroStatus,
                )
              }
            >
              <option value="TODOS">
                Todos
              </option>
              <option value="DISPONIVEIS">
                Disponíveis
              </option>
              <option value="RESERVADOS">
                Reservados
              </option>
              <option value="ESGOTADOS">
                Esgotados
              </option>
              <option value="INATIVOS">
                Inativos
              </option>
            </select>
          </label>
        </div>

        {carregando ? (
          <div className="presentes-admin-estado">
            <OrnamentoFloral compacto />
            <p>Carregando a lista de presentes…</p>
          </div>
        ) : presentesFiltrados.length === 0 ? (
          <div className="presentes-admin-estado">
            <OrnamentoFloral compacto />
            <h2>Nada por aqui.</h2>
            <p>
              Ajuste os filtros ou cadastre um novo presente.
            </p>
          </div>
        ) : (
          <div className="presentes-admin-lista">
            {presentesFiltrados.map(
              (presente) => {
                const status =
                  rotuloStatus(presente);

                return (
                  <article
                    className={[
                      "presente-admin-item",
                      !presente.ativo
                        ? "presente-admin-item--inativo"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={presente.id}
                  >
                    <div className="presente-admin-imagem">
                      {presente.imagemUrl ? (
                        <img
                          src={presente.imagemUrl}
                          alt=""
                        />
                      ) : (
                        <span aria-hidden="true">
                          ❦
                        </span>
                      )}
                    </div>

                    <div className="presente-admin-info">
                      <div className="presente-admin-info-topo">
                        <div>
                          <span className="presente-admin-tipo">
                            {presente.tipo === "COTA"
                              ? "Cota"
                              : "Produto"}
                          </span>

                          <h2>
                            {presente.nome}
                          </h2>
                        </div>

                        <span className={status.classe}>
                          {status.texto}
                        </span>
                      </div>

                      <p>
                        {presente.descricao ??
                          "Sem descrição cadastrada."}
                      </p>

                      <div className="presente-admin-metricas">
                        <span>
                          <small>Valor</small>
                          <strong>
                            {formatarValor(presente)}
                          </strong>
                        </span>

                        <span>
                          <small>Total</small>
                          <strong>
                            {presente.quantidadeTotal}
                          </strong>
                        </span>

                        <span>
                          <small>Reservado</small>
                          <strong>
                            {presente.quantidadeReservada}
                          </strong>
                        </span>

                        <span>
                          <small>Disponível</small>
                          <strong>
                            {presente.quantidadeDisponivel}
                          </strong>
                        </span>
                      </div>

                      {presente.reservasAtivas.length > 0 && (
                        <div className="presente-admin-reservas">
                          <strong>
                            Reserva ativa
                            {presente.reservasAtivas.length > 1
                              ? "s"
                              : ""}
                          </strong>

                          <p>
                            {presente.reservasAtivas
                              .slice(0, 2)
                              .map(
                                (reserva) =>
                                  `${reserva.nomeResponsavel} · ${reserva.quantidade} un.`,
                              )
                              .join("  •  ")}

                            {presente.reservasAtivas.length > 2
                              ? `  •  +${presente.reservasAtivas.length - 2}`
                              : ""}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="presente-admin-acoes">
                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicao(presente)
                        }
                        disabled={salvando}
                      >
                        Editar
                      </button>

                      <button
                        className={
                          presente.ativo
                            ? "presente-admin-acao-perigo"
                            : "presente-admin-acao-reativar"
                        }
                        type="button"
                        onClick={() => {
                          void alterarAtivo(
                            presente,
                          );
                        }}
                        disabled={salvando}
                      >
                        {presente.ativo
                          ? "Desativar"
                          : "Reativar"}
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {formularioAberto && (
        <div
          className="presentes-admin-modal"
          role="presentation"
        >
          <button
            className="presentes-admin-modal-fundo"
            type="button"
            aria-label="Fechar formulário"
            onClick={fecharFormulario}
          />

          <aside
            className="presentes-admin-formulario"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario-presente"
          >
            <header>
              <div>
                <span className="secao-etiqueta">
                  {presenteEditando
                    ? "Editar item"
                    : "Novo item"}
                </span>

                <h2 id="titulo-formulario-presente">
                  {presenteEditando
                    ? "Ajustar presente"
                    : "Adicionar presente"}
                </h2>
              </div>

              <button
                className="presentes-admin-fechar"
                type="button"
                aria-label="Fechar"
                onClick={fecharFormulario}
                disabled={salvando}
              >
                ×
              </button>
            </header>

            {erro && (
              <div
                className="presentes-admin-aviso presentes-admin-aviso--erro"
                role="alert"
              >
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={salvarPresente}>
              <label className="presentes-admin-campo presentes-admin-campo--largo">
                <span>Nome</span>
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={formulario.nome}
                  onChange={(evento) =>
                    setFormulario((atual) => ({
                      ...atual,
                      nome: evento.target.value,
                    }))
                  }
                />
              </label>

              <label className="presentes-admin-campo presentes-admin-campo--largo">
                <span>Descrição</span>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formulario.descricao}
                  onChange={(evento) =>
                    setFormulario((atual) => ({
                      ...atual,
                      descricao:
                        evento.target.value,
                    }))
                  }
                />
              </label>

              <div className="presentes-admin-form-grid">
                <label className="presentes-admin-campo">
                  <span>Tipo</span>
                  <select
                    value={formulario.tipo}
                    onChange={(evento) =>
                      setFormulario((atual) => ({
                        ...atual,
                        tipo:
                          evento.target.value as TipoPresenteAdmin,
                      }))
                    }
                  >
                    <option value="PRODUTO">
                      Produto
                    </option>
                    <option value="COTA">
                      Cota
                    </option>
                  </select>
                </label>

                <label className="presentes-admin-campo">
                  <span>Valor unitário</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="399,90"
                    value={formulario.valorUnitario}
                    onChange={(evento) =>
                      setFormulario((atual) => ({
                        ...atual,
                        valorUnitario:
                          evento.target.value,
                      }))
                    }
                  />
                </label>

                <label className="presentes-admin-campo">
                  <span>Quantidade total</span>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    required
                    value={formulario.quantidadeTotal}
                    onChange={(evento) =>
                      setFormulario((atual) => ({
                        ...atual,
                        quantidadeTotal:
                          evento.target.value,
                      }))
                    }
                  />
                </label>

                <label className="presentes-admin-campo">
                  <span>Ordem</span>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    required
                    value={formulario.ordem}
                    onChange={(evento) =>
                      setFormulario((atual) => ({
                        ...atual,
                        ordem:
                          evento.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="presentes-admin-campo presentes-admin-campo--largo">
                <span>Imagem do presente</span>

                <div className="presentes-admin-upload">
                  <div className="presentes-admin-upload-preview">
                    {(previewImagem || formulario.imagemUrl) ? (
                      <img
                        src={previewImagem || formulario.imagemUrl}
                        alt="Prévia da imagem do presente"
                      />
                    ) : (
                      <span aria-hidden="true">❦</span>
                    )}
                  </div>

                  <div className="presentes-admin-upload-conteudo">
                    <label className="presentes-admin-upload-botao">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(evento) =>
                          selecionarImagem(
                            evento.target.files?.[0] ?? null,
                          )
                        }
                      />

                      <span>
                        {arquivoImagem
                          ? "Trocar arquivo"
                          : "Escolher imagem"}
                      </span>
                    </label>

                    <small>
                      JPEG, PNG ou WebP · máximo de 5 MB.
                    </small>

                    {arquivoImagem && (
                      <small className="presentes-admin-upload-arquivo">
                        {arquivoImagem.name}
                      </small>
                    )}

                    {(previewImagem || formulario.imagemUrl) && (
                      <button
                        className="presentes-admin-upload-remover"
                        type="button"
                        onClick={removerImagemFormulario}
                        disabled={salvando}
                      >
                        Remover imagem
                      </button>
                    )}
                  </div>
                </div>

                <label className="presentes-admin-url-alternativa">
                  <span>Ou use uma URL</span>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formulario.imagemUrl}
                    onChange={(evento) => {
                      limparImagemSelecionada();

                      setFormulario((atual) => ({
                        ...atual,
                        imagemUrl:
                          evento.target.value,
                      }));
                    }}
                  />
                </label>
              </div>

              <label className="presentes-admin-campo presentes-admin-campo--largo">
                <span>Link externo</span>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formulario.urlExterna}
                  onChange={(evento) =>
                    setFormulario((atual) => ({
                      ...atual,
                      urlExterna:
                        evento.target.value,
                    }))
                  }
                />
              </label>

              <label className="presentes-admin-checkbox">
                <input
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={(evento) =>
                    setFormulario((atual) => ({
                      ...atual,
                      ativo:
                        evento.target.checked,
                    }))
                  }
                />

                <span>
                  <strong>Disponível no site público</strong>
                  <small>
                    Desmarque para manter o item cadastrado sem exibi-lo aos convidados.
                  </small>
                </span>
              </label>

              <div className="presentes-admin-form-acoes">
                <button
                  className="botao botao--secundario"
                  type="button"
                  onClick={fecharFormulario}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  className="botao botao--primario"
                  type="submit"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando…"
                    : presenteEditando
                      ? "Salvar alterações"
                      : "Cadastrar presente"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
