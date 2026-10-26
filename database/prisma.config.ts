import { defineConfig, env } from "prisma/config";

import "../backend/configs/Caminhos.js";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seeds/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
