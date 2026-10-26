export class ErroAplicacao extends Error {
  public readonly statusHttp: number;
  public readonly codigo: string;
  public readonly detalhes: unknown | undefined;
  public readonly operacional: boolean;

  constructor(
    mensagem: string,
    statusHttp: number,
    codigo: string,
    detalhes?: unknown,
  ) {
    super(mensagem);

    this.name = "ErroAplicacao";

    this.statusHttp = statusHttp;
    this.codigo = codigo;
    this.detalhes = detalhes;

    this.operacional = true;

    Error.captureStackTrace?.(this, ErroAplicacao);
  }

  static requisicaoInvalida(
    mensagem = "A requisição enviada é inválida.",
    codigo = "REQUISICAO_INVALIDA",
    detalhes?: unknown,
  ) {
    return new ErroAplicacao(
      mensagem,
      400,
      codigo,
      detalhes,
    );
  }

  static naoAutorizado(
    mensagem = "Autenticação necessária.",
    codigo = "NAO_AUTORIZADO",
  ) {
    return new ErroAplicacao(
      mensagem,
      401,
      codigo,
    );
  }

  static proibido(
    mensagem = "Você não possui permissão para realizar esta ação.",
    codigo = "ACESSO_NEGADO",
  ) {
    return new ErroAplicacao(
      mensagem,
      403,
      codigo,
    );
  }

  static naoEncontrado(
    mensagem = "O recurso solicitado não foi encontrado.",
    codigo = "RECURSO_NAO_ENCONTRADO",
  ) {
    return new ErroAplicacao(
      mensagem,
      404,
      codigo,
    );
  }

  static conflito(
    mensagem = "A operação entrou em conflito com o estado atual do recurso.",
    codigo = "CONFLITO",
    detalhes?: unknown,
  ) {
    return new ErroAplicacao(
      mensagem,
      409,
      codigo,
      detalhes,
    );
  }
}