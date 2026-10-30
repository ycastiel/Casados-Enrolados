import type { RequestHandler } from "express";

import { ErroAplicacao } from "../../services/helpers/erros/ErrosIndex.js";
import {
  removerImagemLocalPresente,
  urlPublicaImagemPresente,
} from "../../services/presentes/ImagensPresentes.js";

import {
  atualizarPresenteAdmin,
  criarPresenteAdmin,
  desativarPresenteAdmin,
  listarPresentesAdmin,
} from "../../services/presentes/Presentes.js";

import type {
  AtualizarPresenteDados,
  CriarPresenteDados,
  PresenteIdParams,
  RemoverImagemPresenteDados,
} from "../../validators/presentes/PresenteValidator.js";

type Validado = {
  body?: unknown;
  params?: unknown;
};

export const obterPresentesAdmin: RequestHandler =
  async (_req, res) => {
    const presentes =
      await listarPresentesAdmin();

    res.status(200).json({
      dados: {
        presentes,
      },
    });
  };

export const cadastrarPresenteAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const dados =
      validado.body as CriarPresenteDados;

    const presente =
      await criarPresenteAdmin(dados);

    res.status(201).json({
      dados: {
        presente,
      },
    });
  };

export const editarPresenteAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as PresenteIdParams;

    const dados =
      validado.body as AtualizarPresenteDados;

    const presente =
      await atualizarPresenteAdmin(
        id,
        dados,
      );

    res.status(200).json({
      dados: {
        presente,
      },
    });
  };

export const excluirPresenteAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { id } =
      validado.params as PresenteIdParams;

    await desativarPresenteAdmin(id);

    res.status(204).send();
  };


export const enviarImagemPresenteAdmin: RequestHandler =
  async (req, res) => {
    const arquivo = req.file;

    if (!arquivo) {
      throw ErroAplicacao.requisicaoInvalida(
        "Selecione uma imagem para enviar.",
        "IMAGEM_PRESENTE_NAO_ENVIADA",
      );
    }

    res.status(201).json({
      dados: {
        imagem: {
          url: urlPublicaImagemPresente(
            arquivo.filename,
          ),
          nomeOriginal: arquivo.originalname,
          mimeType: arquivo.mimetype,
          tamanho: arquivo.size,
        },
      },
    });
  };

export const apagarImagemPresenteAdmin: RequestHandler =
  async (_req, res) => {
    const validado =
      res.locals.validado as Validado;

    const { url } =
      validado.body as RemoverImagemPresenteDados;

    await removerImagemLocalPresente(url);

    res.status(204).send();
  };
