import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/Client.js"; 

const __dirname = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(__dirname, "../../.env"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não foi definida. Verifique o arquivo .env na raiz do projeto.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({
  adapter,
});