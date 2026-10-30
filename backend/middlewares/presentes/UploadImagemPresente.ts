import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { RequestHandler } from "express";
import multer from "multer";

import { CAMINHO_UPLOADS_PRESENTES } from "../../configs/Caminhos.js";
import { ErroAplicacao } from "../../services/helpers/erros/ErrosIndex.js";

const CINCO_MEGABYTES = 5 * 1024 * 1024;

const extensoesPorMime: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

fs.mkdirSync(
  CAMINHO_UPLOADS_PRESENTES,
  {
    recursive: true,
  },
);

const armazenamento = multer.diskStorage({
  destination: (_req, _arquivo, callback) => {
    callback(
      null,
      CAMINHO_UPLOADS_PRESENTES,
    );
  },

  filename: (_req, arquivo, callback) => {
    const extensao =
      extensoesPorMime[arquivo.mimetype];

    callback(
      null,
      `${crypto.randomUUID()}${extensao}`,
    );
  },
});

const upload = multer({
  storage: armazenamento,

  limits: {
    files: 1,
    fileSize: CINCO_MEGABYTES,
  },

  fileFilter: (_req, arquivo, callback) => {
    if (
      extensoesPorMime[arquivo.mimetype]
    ) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "FORMATO_IMAGEM_NAO_SUPORTADO",
      ),
    );
  },
});

const receberUmaImagem =
  upload.single("imagem");

export const processarUploadImagemPresente: RequestHandler =
  (req, res, next) => {
    receberUmaImagem(
      req,
      res,
      (erro: unknown) => {
        if (!erro) {
          next();
          return;
        }

        if (
          erro instanceof multer.MulterError
        ) {
          if (
            erro.code === "LIMIT_FILE_SIZE"
          ) {
            next(
              ErroAplicacao.requisicaoInvalida(
                "A imagem pode ter no máximo 5 MB.",
                "IMAGEM_PRESENTE_MUITO_GRANDE",
              ),
            );
            return;
          }

          next(
            ErroAplicacao.requisicaoInvalida(
              "Não foi possível receber a imagem enviada.",
              "UPLOAD_IMAGEM_PRESENTE_INVALIDO",
              {
                codigoMulter: erro.code,
              },
            ),
          );
          return;
        }

        if (
          erro instanceof Error &&
          erro.message ===
            "FORMATO_IMAGEM_NAO_SUPORTADO"
        ) {
          next(
            ErroAplicacao.requisicaoInvalida(
              "Envie uma imagem JPEG, PNG ou WebP.",
              "FORMATO_IMAGEM_PRESENTE_INVALIDO",
            ),
          );
          return;
        }

        next(erro);
      },
    );
  };
