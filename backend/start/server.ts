import { ambiente } from "../config/Ambiente.js";

const { app } = await import("./app.js");

app.listen(ambiente.PORT, () => {
  console.log("💍 Casados & Enrolados");
  console.log(`🚀 Servidor rodando em http://localhost:${ambiente.PORT}`);
  console.log(`🌱 Ambiente: ${ambiente.NODE_ENV}`);
});
