import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  adicionarConvidadoAdmin,
  atualizarConvidadoAdmin,
  atualizarConviteAdmin,
  criarConviteAdmin,
  listarConvitesAdmin,
  removerConvidadoAdmin,
  removerConviteAdmin,
  type ConvidadoAdmin,
  type ConviteAdmin,
  type NovoConvidado,
} from "../../javascript/paginas/noivos/Convites";

import { OrnamentoFloral } from "../../javascript/componentes/Floral";

import "../../css/paginas/noivos/convidados.css";

type FormularioConvidado = {
  nome: string;
  email: string;
  telefone: string;
};

const convidadoVazio: FormularioConvidado = {
  nome: "",
  email: "",
  telefone: "",
};

function statusConvidado(
  convidado: ConvidadoAdmin,
) {
  if (convidado.confirmacoes.length === 0) {
    return {
      texto: "Sem eventos",
      classe:
        "status-convidado status-convidado--neutro",
    };
  }

  const statuses =
    convidado.confirmacoes.map(
      (confirmacao) => confirmacao.status,
    );

  if (
    statuses.every(
      (status) => status === "CONFIRMADO",
    )
  ) {
    return {
      texto: "Confirmado",
      classe:
        "status-convidado status-convidado--confirmado",
    };
  }

  if (
    statuses.every(
      (status) => status === "RECUSADO",
    )
  ) {
    return {
      texto: "Recusou",
      classe:
        "status-convidado status-convidado--recusado",
    };
  }

  if (
    statuses.some(
      (status) => status !== "PENDENTE",
    )
  ) {
    return {
      texto: "Parcial",
      classe:
        "status-convidado status-convidado--parcial",
    };
  }

  return {
    texto: "Pendente",
    classe:
      "status-convidado status-convidado--pendente",
  };
}

export function Convidados() {
  const [convites, setConvites] =
    useState<ConviteAdmin[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  const [salvando, setSalvando] =
    useState(false);

  const [novoGrupo, setNovoGrupo] =
    useState("");

  const [primeiroConvidado, setPrimeiroConvidado] =
    useState<FormularioConvidado>(
      convidadoVazio,
    );

  const [
    conviteAdicionandoPessoa,
    setConviteAdicionandoPessoa,
  ] = useState<string | null>(null);

  const [
    novoConvidado,
    setNovoConvidado,
  ] = useState<FormularioConvidado>(
    convidadoVazio,
  );

  const [
    conviteEditando,
    setConviteEditando,
  ] = useState<string | null>(null);

  const [
    nomeConviteEditado,
    setNomeConviteEditado,
  ] = useState("");

  const [
    convidadoEditando,
    setConvidadoEditando,
  ] = useState<string | null>(null);

  const [
    convidadoEditado,
    setConvidadoEditado,
  ] = useState<FormularioConvidado>(
    convidadoVazio,
  );

  async function carregarConvites() {
    try {
      setCarregando(true);
      setErro(null);

      const resultado =
        await listarConvitesAdmin();

      setConvites(resultado);
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível carregar os convidados.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarConvites();
  }, []);

  const totalConvidados =
    useMemo(
      () =>
        convites.reduce(
          (total, convite) =>
            total +
            convite.convidados.length,
          0,
        ),
      [convites],
    );

  const totalConfirmados =
    useMemo(
      () =>
        convites.reduce(
          (total, convite) =>
            total +
            convite.convidados.filter(
              (convidado) =>
                convidado.confirmacoes.length >
                  0 &&
                convidado.confirmacoes.every(
                  (confirmacao) =>
                    confirmacao.status ===
                    "CONFIRMADO",
                ),
            ).length,
          0,
        ),
      [convites],
    );

  async function criarGrupo(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    try {
      setSalvando(true);
      setErro(null);

      const convite =
        await criarConviteAdmin({
          nomeExibicao: novoGrupo,
          convidados: [
            {
              nome:
                primeiroConvidado.nome,
              email:
                primeiroConvidado.email ||
                undefined,
              telefone:
                primeiroConvidado.telefone ||
                undefined,
            },
          ],
        });

      setConvites((atuais) => [
        ...atuais,
        convite,
      ]);

      setNovoGrupo("");
      setPrimeiroConvidado(
        convidadoVazio,
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível criar o convite.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarPessoa(
    conviteId: string,
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    try {
      setSalvando(true);
      setErro(null);

      const convidado =
        await adicionarConvidadoAdmin(
          conviteId,
          {
            nome: novoConvidado.nome,
            email:
              novoConvidado.email ||
              undefined,
            telefone:
              novoConvidado.telefone ||
              undefined,
          },
        );

      setConvites((atuais) =>
        atuais.map((convite) =>
          convite.id === conviteId
            ? {
                ...convite,
                convidados: [
                  ...convite.convidados,
                  convidado,
                ].sort((a, b) =>
                  a.nome.localeCompare(
                    b.nome,
                    "pt-BR",
                  ),
                ),
              }
            : convite,
        ),
      );

      setConviteAdicionandoPessoa(null);
      setNovoConvidado(convidadoVazio);
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível adicionar o convidado.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function salvarNomeConvite(
    conviteId: string,
  ) {
    try {
      setSalvando(true);
      setErro(null);

      const conviteAtualizado =
        await atualizarConviteAdmin(
          conviteId,
          {
            nomeExibicao:
              nomeConviteEditado,
          },
        );

      setConvites((atuais) =>
        atuais.map((convite) =>
          convite.id === conviteId
            ? conviteAtualizado
            : convite,
        ),
      );

      setConviteEditando(null);
      setNomeConviteEditado("");
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível editar o convite.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function salvarConvidado(
    convidadoId: string,
  ) {
    try {
      setSalvando(true);
      setErro(null);

      const atualizado =
        await atualizarConvidadoAdmin(
          convidadoId,
          {
            nome: convidadoEditado.nome,
            email:
              convidadoEditado.email ||
              undefined,
            telefone:
              convidadoEditado.telefone ||
              undefined,
          },
        );

      setConvites((atuais) =>
        atuais.map((convite) => ({
          ...convite,

          convidados:
            convite.convidados.map(
              (convidado) =>
                convidado.id ===
                convidadoId
                  ? atualizado
                  : convidado,
            ),
        })),
      );

      setConvidadoEditando(null);
      setConvidadoEditado(
        convidadoVazio,
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível editar o convidado.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirConvidado(
    convidadoId: string,
  ) {
    const confirmado =
      window.confirm(
        "Remover este convidado do convite? As confirmações dele também serão removidas.",
      );

    if (!confirmado) {
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      await removerConvidadoAdmin(
        convidadoId,
      );

      setConvites((atuais) =>
        atuais.map((convite) => ({
          ...convite,

          convidados:
            convite.convidados.filter(
              (convidado) =>
                convidado.id !==
                convidadoId,
            ),
        })),
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível remover o convidado.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirConvite(
    conviteId: string,
  ) {
    const confirmado =
      window.confirm(
        "Desativar este convite? Ele deixará de aparecer na gestão e não poderá ser usado pelos convidados.",
      );

    if (!confirmado) {
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      await removerConviteAdmin(
        conviteId,
      );

      setConvites((atuais) =>
        atuais.filter(
          (convite) =>
            convite.id !== conviteId,
        ),
      );
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível desativar o convite.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="admin-convidados">
      <header className="convidados-cabecalho">
        <div>
          <span className="secao-etiqueta">
            Lista de convidados
          </span>

          <h1>
            Quem vai fazer parte desse dia?
          </h1>

          <p>
            Organize por convite ou família e
            mantenha as pessoas daquele grupo
            juntas.
          </p>
        </div>

        <div className="convidados-resumo">
          <div>
            <strong>
              {totalConvidados}
            </strong>
            <span>convidados</span>
          </div>

          <div>
            <strong>
              {totalConfirmados}
            </strong>
            <span>confirmados</span>
          </div>
        </div>
      </header>

      {erro && (
        <div
          className="convidados-erro"
          role="alert"
        >
          <span>{erro}</span>

          <button
            type="button"
            onClick={() => setErro(null)}
          >
            ×
          </button>
        </div>
      )}

      <section className="novo-convite">
        <div className="novo-convite-texto">
          <span className="secao-etiqueta">
            Novo convite
          </span>

          <h2>
            Adicione uma família ou grupo
          </h2>

          <p>
            Comece dando um nome ao convite
            e cadastrando a primeira pessoa.
            Depois você pode adicionar os
            demais acompanhantes no mesmo card.
          </p>
        </div>

        <form
          className="novo-convite-formulario"
          onSubmit={criarGrupo}
        >
          <label>
            Nome do convite
            <input
              required
              type="text"
              value={novoGrupo}
              placeholder="Ex.: Família Oliveira"
              onChange={(evento) =>
                setNovoGrupo(
                  evento.target.value,
                )
              }
            />
          </label>

          <label>
            Primeiro convidado
            <input
              required
              type="text"
              value={
                primeiroConvidado.nome
              }
              placeholder="Nome completo"
              onChange={(evento) =>
                setPrimeiroConvidado(
                  (atual) => ({
                    ...atual,
                    nome:
                      evento.target.value,
                  }),
                )
              }
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              value={
                primeiroConvidado.email
              }
              placeholder="Opcional"
              onChange={(evento) =>
                setPrimeiroConvidado(
                  (atual) => ({
                    ...atual,
                    email:
                      evento.target.value,
                  }),
                )
              }
            />
          </label>

          <button
            className="botao botao--primario"
            type="submit"
            disabled={salvando}
          >
            Criar convite
          </button>
        </form>
      </section>

      <section
        className="convites-lista"
        aria-live="polite"
      >
        <div className="convites-lista-cabecalho">
          <div>
            <span className="secao-etiqueta">
              Seus convites
            </span>

            <h2>
              Famílias e grupos
            </h2>
          </div>

          {!carregando && (
            <span className="convites-contagem">
              {convites.length}{" "}
              {convites.length === 1
                ? "convite"
                : "convites"}
            </span>
          )}
        </div>

        {carregando ? (
          <div className="convites-estado">
            <OrnamentoFloral compacto />
            <p>
              Buscando a lista de convidados...
            </p>
          </div>
        ) : convites.length === 0 ? (
          <div className="convites-estado">
            <OrnamentoFloral compacto />

            <h3>
              A lista ainda está vazia.
            </h3>

            <p>
              Crie o primeiro convite usando
              o formulário acima.
            </p>
          </div>
        ) : (
          <div className="convites-grade">
            {convites.map((convite) => (
              <article
                className="convite-admin-card"
                key={convite.id}
              >
                <header className="convite-admin-cabecalho">
                  <div>
                    <span>
                      Convite
                    </span>

                    {conviteEditando ===
                    convite.id ? (
                      <div className="edicao-inline">
                        <input
                          autoFocus
                          value={
                            nomeConviteEditado
                          }
                          onChange={(
                            evento,
                          ) =>
                            setNomeConviteEditado(
                              evento.target
                                .value,
                            )
                          }
                        />

                        <button
                          type="button"
                          disabled={salvando}
                          onClick={() =>
                            void salvarNomeConvite(
                              convite.id,
                            )
                          }
                        >
                          Salvar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConviteEditando(
                              null,
                            )
                          }
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <h3>
                        {convite.nomeExibicao}
                      </h3>
                    )}
                  </div>

                  <div className="convite-admin-acoes">
                    <button
                      type="button"
                      onClick={() => {
                        setConviteEditando(
                          convite.id,
                        );

                        setNomeConviteEditado(
                          convite.nomeExibicao,
                        );
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="acao-perigosa"
                      type="button"
                      onClick={() =>
                        void excluirConvite(
                          convite.id,
                        )
                      }
                    >
                      Desativar
                    </button>
                  </div>
                </header>

                <div className="convite-token">
                  <span>
                    Código do convite
                  </span>

                  <code>
                    {convite.token}
                  </code>
                </div>

                <div className="convidados-do-convite">
                  {convite.convidados.map(
                    (convidado) => {
                      const status =
                        statusConvidado(
                          convidado,
                        );

                      return (
                        <div
                          className="convidado-linha"
                          key={convidado.id}
                        >
                          {convidadoEditando ===
                          convidado.id ? (
                            <div className="convidado-edicao">
                              <input
                                autoFocus
                                value={
                                  convidadoEditado.nome
                                }
                                placeholder="Nome"
                                onChange={(
                                  evento,
                                ) =>
                                  setConvidadoEditado(
                                    (
                                      atual,
                                    ) => ({
                                      ...atual,
                                      nome:
                                        evento
                                          .target
                                          .value,
                                    }),
                                  )
                                }
                              />

                              <input
                                type="email"
                                value={
                                  convidadoEditado.email
                                }
                                placeholder="E-mail"
                                onChange={(
                                  evento,
                                ) =>
                                  setConvidadoEditado(
                                    (
                                      atual,
                                    ) => ({
                                      ...atual,
                                      email:
                                        evento
                                          .target
                                          .value,
                                    }),
                                  )
                                }
                              />

                              <div className="edicao-inline">
                                <button
                                  type="button"
                                  disabled={
                                    salvando
                                  }
                                  onClick={() =>
                                    void salvarConvidado(
                                      convidado.id,
                                    )
                                  }
                                >
                                  Salvar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setConvidadoEditando(
                                      null,
                                    )
                                  }
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="convidado-identidade">
                                <strong>
                                  {convidado.nome}
                                </strong>

                                <span>
                                  {convidado.email ??
                                    convidado.telefone ??
                                    "Sem contato cadastrado"}
                                </span>
                              </div>

                              <span
                                className={
                                  status.classe
                                }
                              >
                                {status.texto}
                              </span>

                              <div className="convidado-acoes">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConvidadoEditando(
                                      convidado.id,
                                    );

                                    setConvidadoEditado(
                                      {
                                        nome:
                                          convidado.nome,
                                        email:
                                          convidado.email ??
                                          "",
                                        telefone:
                                          convidado.telefone ??
                                          "",
                                      },
                                    );
                                  }}
                                >
                                  Editar
                                </button>

                                <button
                                  className="acao-perigosa"
                                  type="button"
                                  onClick={() =>
                                    void excluirConvidado(
                                      convidado.id,
                                    )
                                  }
                                >
                                  Remover
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>

                {conviteAdicionandoPessoa ===
                convite.id ? (
                  <form
                    className="novo-convidado-inline"
                    onSubmit={(evento) =>
                      void adicionarPessoa(
                        convite.id,
                        evento,
                      )
                    }
                  >
                    <input
                      required
                      type="text"
                      value={novoConvidado.nome}
                      placeholder="Nome do convidado"
                      onChange={(evento) =>
                        setNovoConvidado(
                          (atual) => ({
                            ...atual,
                            nome:
                              evento.target
                                .value,
                          }),
                        )
                      }
                    />

                    <input
                      type="email"
                      value={novoConvidado.email}
                      placeholder="E-mail (opcional)"
                      onChange={(evento) =>
                        setNovoConvidado(
                          (atual) => ({
                            ...atual,
                            email:
                              evento.target
                                .value,
                          }),
                        )
                      }
                    />

                    <div className="edicao-inline">
                      <button
                        className="botao botao--primario"
                        type="submit"
                        disabled={salvando}
                      >
                        Adicionar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConviteAdicionandoPessoa(
                            null,
                          );

                          setNovoConvidado(
                            convidadoVazio,
                          );
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="adicionar-pessoa"
                    type="button"
                    onClick={() => {
                      setConviteAdicionandoPessoa(
                        convite.id,
                      );

                      setNovoConvidado(
                        convidadoVazio,
                      );
                    }}
                  >
                    + Adicionar pessoa
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
