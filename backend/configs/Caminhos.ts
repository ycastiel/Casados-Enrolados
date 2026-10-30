import fs from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const arquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(arquivoAtual);

function encontrarRaizProjeto(inicio: string): string {
  let diretorio = inicio;

  while (true) {
    const packageJson = path.join(diretorio, "package.json");
    const backend = path.join(diretorio, "backend");
    const database = path.join(diretorio, "database");
    const frontend = path.join(diretorio, "frontend");

    const ehRaizDoProjeto =
      fs.existsSync(packageJson) &&
      fs.existsSync(backend) &&
      fs.existsSync(database) &&
      fs.existsSync(frontend);

    if (ehRaizDoProjeto) {
      return diretorio;
    }

    const pai = path.dirname(diretorio);

    if (pai === diretorio) {
      throw new Error(
        "Não foi possível localizar a raiz do projeto Casados & Enrolados.",
      );
    }

    diretorio = pai;
  }
}

export const RAIZ_PROJETO = encontrarRaizProjeto(diretorioAtual);
export const RAIZ_BACKEND = path.join(RAIZ_PROJETO, "backend");
export const RAIZ_DATABASE = path.join(RAIZ_PROJETO, "database");
export const RAIZ_FRONTEND = path.join(RAIZ_PROJETO, "frontend");
export const CAMINHO_UPLOADS = path.join(RAIZ_BACKEND, "uploads");
export const CAMINHO_UPLOADS_PRESENTES = path.join(
  CAMINHO_UPLOADS,
  "presentes",
);

export const CAMINHO_ENV = path.join(RAIZ_PROJETO, ".env");

if (!fs.existsSync(CAMINHO_ENV)) {
  throw new Error(`Arquivo .env não encontrado em: ${CAMINHO_ENV}`);
}


loadEnvFile(CAMINHO_ENV);
