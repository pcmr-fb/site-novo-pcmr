import express from "express";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { createApp } from "./app.mjs";

const production = process.argv.includes("--production");
const { app, close } = createApp({
  production,
  dataDir: resolve(process.env.DATA_DIR || ".data"),
});
const port = Number(process.env.PORT || 3000);
let vite;
if (production) {
  if (!existsSync(resolve("dist/index.html")))
    throw new Error("Execute npm run build antes de npm start.");
  app.use(express.static(resolve("dist"), { index: false, maxAge: "1h" }));
  app.get("/", (_req, res) => res.sendFile(resolve("dist/index.html")));
  app.use((_req, res) => res.status(404).send("Página não encontrada."));
} else {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
const server = app.listen(port, process.env.HOST || "0.0.0.0", (error) => {
  if (error) {
    console.error(`Server could not start: ${error.code}`);
    process.exit(1);
  }
  console.log(
    `PC&MR ${production ? "production" : "development"} listening on port ${port}`,
  );
});
async function shutdown() {
  server.close();
  await vite?.close();
  close();
  process.exit(0);
}
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
