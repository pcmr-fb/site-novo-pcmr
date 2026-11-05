import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const quoteSchema = z
  .object({
    requestId: z.uuid(),
    insurance: z.enum([
      "auto",
      "residencial",
      "vida",
      "empresarial",
      "saude",
      "viagem",
      "orientacao",
    ]),
    name: z.string().trim().min(3).max(100),
    email: z.email().max(254),
    phone: z.string().regex(/^\d{10,11}$/),
    city: z.string().trim().min(2).max(100),
    message: z.string().trim().max(1000).default(""),
    consent: z.literal(true),
    website: z.string().max(200).optional().default(""),
  })
  .strict();

export function createApp({
  dataDir = resolve(".data"),
  production = false,
  siteOrigin = process.env.SITE_ORIGIN,
  rateLimitMax = 10,
} = {}) {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const dbPath = resolve(dataDir, "quotes.sqlite");
  const db = new DatabaseSync(dbPath);
  chmodSync(dbPath, 0o600);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, insurance TEXT NOT NULL,
      name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, city TEXT NOT NULL,
      message TEXT NOT NULL, consent_version TEXT NOT NULL, created_at TEXT NOT NULL
    )`);
  const insert = db.prepare(
    "INSERT INTO quotes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const existing = db.prepare(
    "SELECT id, insurance, name, email, phone, city, message FROM quotes WHERE request_id = ?",
  );
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY_HOPS) {
    const hops = Number(process.env.TRUST_PROXY_HOPS);
    if (!Number.isInteger(hops) || hops < 1 || hops > 3)
      throw new Error("TRUST_PROXY_HOPS must be between 1 and 3.");
    app.set("trust proxy", hops);
  }
  app.use(
    helmet({
      contentSecurityPolicy: production
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'"],
              imgSrc: ["'self'", "data:"],
              fontSrc: ["'self'"],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'self'"],
              upgradeInsecureRequests: null,
            },
          }
        : false,
      strictTransportSecurity:
        production && siteOrigin?.startsWith("https://") ? undefined : false,
    }),
  );
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.get("/api/health", (_req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
  app.use(
    "/api/quotes",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: rateLimitMax,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        error:
          "Você fez várias tentativas. Aguarde alguns minutos e tente novamente.",
      },
    }),
  );
  app.post(
    "/api/quotes",
    (req, res, next) => {
      if (!req.is("application/json"))
        return res
          .status(415)
          .json({ error: "Formato de solicitação inválido." });
      if (req.get("sec-fetch-site") === "cross-site")
        return res.status(403).json({ error: "Origem não autorizada." });
      const origin = req.get("origin");
      const allowedOrigin =
        siteOrigin || `${req.protocol}://${req.get("host")}`;
      if (origin && origin !== allowedOrigin)
        return res.status(403).json({ error: "Origem não autorizada." });
      next();
    },
    express.json({ limit: "8kb" }),
    (req, res) => {
      const result = quoteSchema.safeParse(req.body);
      if (!result.success)
        return res
          .status(400)
          .json({
            error: "Revise os campos e autorize o contato para continuar.",
          });
      const {
        requestId,
        insurance,
        name,
        email,
        phone,
        city,
        message,
        website,
      } = result.data;
      if (website)
        return res
          .status(400)
          .json({ error: "Não foi possível validar a solicitação." });
      try {
        const previous = existing.get(requestId);
        if (previous) {
          if (
            previous.insurance !== insurance ||
            previous.name !== name ||
            previous.email !== email ||
            previous.phone !== phone ||
            previous.city !== city ||
            previous.message !== message
          ) {
            return res
              .status(409)
              .json({
                error:
                  "Esta solicitação já foi registrada com outros dados. Inicie uma nova cotação.",
              });
          }
          return res.json({ protocol: previous.id });
        }
        const id = randomUUID();
        insert.run(
          id,
          requestId,
          insurance,
          name,
          email,
          phone,
          city,
          message,
          "2026-11-05",
          new Date().toISOString(),
        );
        return res.status(201).json({ protocol: id });
      } catch {
        return res
          .status(503)
          .json({
            error:
              "Não foi possível registrar agora. Seus dados continuam no formulário. Tente novamente.",
          });
      }
    },
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Recurso não encontrado." }),
  );
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.too.large")
      return res.status(413).json({ error: "Solicitação muito longa." });
    if (err.type === "entity.parse.failed")
      return res.status(400).json({ error: "Solicitação inválida." });
    res.status(500).json({ error: "Ocorreu um problema. Tente novamente." });
  });
  return { app, close: () => db.close() };
}
