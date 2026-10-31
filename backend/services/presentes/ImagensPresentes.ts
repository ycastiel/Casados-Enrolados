import fs from "node:fs/promises";
import path from "node:path";

import { CAMINHO_UPLOADS_PRESENTES } from "../../configs/Caminhos.js";

const PREFIXO_PUBLICO = "/api/uploads/presentes/";

export function urlPublicaImagemPresente(
  nomeArquivo: string,
) {
  return `${PREFIXO_PUBLICO}${encodeURIComponent(nomeArquivo)}`;
}

export function ehImagemLocalPresente(
  url: string | null | undefined,
) {
  return Boolean(
    url &&
      url.startsWith(PREFIXO_PUBLICO),
  );
}

export async function removerImagemLocalPresente(
  url: string,
) {
  if (!ehImagemLocalPresente(url)) {
    return false;
  }

  const trechoArquivo =
    url.slice(PREFIXO_PUBLICO.length);

  const nomeArquivo = path.basename(
    decodeURIComponent(trechoArquivo),
  );

  if (!nomeArquivo) {
    return false;
  }

  const caminhoArquivo = path.join(
    CAMINHO_UPLOADS_PRESENTES,
    nomeArquivo,
  );

  try {
    await fs.unlink(caminhoArquivo);
    return true;
  } catch (erro) {
    if (
      erro instanceof Error &&
      "code" in erro &&
      erro.code === "ENOENT"
    ) {
      return false;
    }

    throw erro;
  }
}
