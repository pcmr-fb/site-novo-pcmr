import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import request from "supertest";
import { createApp } from "../server/app.mjs";

function fixture(t, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), "pcmr-test-"));
  const instance = createApp({ dataDir: dir, ...options });
  t.after(() => {
    instance.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { ...instance, dir };
}
const validQuote = () => ({
  requestId: randomUUID(),
  insurance: "residencial",
  name: "Pessoa de Teste",
  email: "teste@example.com",
  phone: "11999999999",
  city: "São Paulo / SP",
  message: "Teste automatizado",
  consent: true,
  website: "",
});

test("records a real quote, consent version and timestamp; an identical retry returns the original protocol", async (t) => {
  const { app, dir } = fixture(t);
  const body = validQuote();
  const first = await request(app).post("/api/quotes").send(body).expect(201);
  assert.match(first.body.protocol, /^[0-9a-f-]{36}$/);
  const second = await request(app).post("/api/quotes").send(body).expect(200);
  assert.equal(second.body.protocol, first.body.protocol);
  const db = new DatabaseSync(join(dir, "quotes.sqlite"), { readOnly: true });
  const row = db.prepare("SELECT * FROM quotes").get();
  assert.equal(row.name, body.name);
  assert.equal(row.email, body.email);
  assert.equal(row.insurance, body.insurance);
  assert.equal(row.consent_version, "2026-11-05");
  assert.ok(!Number.isNaN(Date.parse(row.created_at)));
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM quotes").get().count,
    1,
  );
  db.close();
});

test("rejects missing consent, invalid telephone, unknown product, extra fields and honeypot submissions", async (t) => {
  const { app } = fixture(t);
  for (const patch of [
    { consent: false },
    { phone: "123" },
    { insurance: "unknown" },
    { administrator: true },
    { website: "spam.example" },
  ]) {
    await request(app)
      .post("/api/quotes")
      .send({ ...validQuote(), ...patch })
      .expect(400);
  }
});

test("rejects malformed JSON, excessive body sizes and non-JSON requests", async (t) => {
  const { app } = fixture(t);
  await request(app)
    .post("/api/quotes")
    .set("Content-Type", "application/json")
    .send("{broken")
    .expect(400);
  await request(app)
    .post("/api/quotes")
    .send({ ...validQuote(), message: "x".repeat(10000) })
    .expect(413);
  await request(app)
    .post("/api/quotes")
    .type("form")
    .send({ name: "Test" })
    .expect(415);
});

test("blocks cross-site submissions and permits the configured same origin", async (t) => {
  const { app } = fixture(t, { siteOrigin: "https://preview.example.com" });
  await request(app)
    .post("/api/quotes")
    .set("Origin", "https://other.example.com")
    .send(validQuote())
    .expect(403);
  await request(app)
    .post("/api/quotes")
    .set("Sec-Fetch-Site", "cross-site")
    .send(validQuote())
    .expect(403);
  await request(app)
    .post("/api/quotes")
    .set("Origin", "https://preview.example.com")
    .send(validQuote())
    .expect(201);
});

test("a reused request identifier cannot overwrite a previous quote", async (t) => {
  const { app } = fixture(t);
  const body = validQuote();
  await request(app).post("/api/quotes").send(body).expect(201);
  await request(app)
    .post("/api/quotes")
    .send({ ...body, name: "Another Person" })
    .expect(409);
});

test("rate limits repeated requests", async (t) => {
  const { app } = fixture(t, { rateLimitMax: 2 });
  await request(app).post("/api/quotes").send(validQuote()).expect(201);
  await request(app).post("/api/quotes").send(validQuote()).expect(201);
  await request(app).post("/api/quotes").send(validQuote()).expect(429);
});

test("health checks the database and the API does not expose stored quotes", async (t) => {
  const { app } = fixture(t, { production: true });
  const health = await request(app).get("/api/health").expect(200);
  assert.equal(health.body.status, "ok");
  assert.equal(health.headers["cache-control"], "no-store");
  assert.ok(
    health.headers["content-security-policy"].includes("default-src 'self'"),
  );
  await request(app).get("/api/quotes").expect(404);
  await request(app).get("/api/quotes.sqlite").expect(404);
});

test("stored quotes survive closing and reopening the database", async () => {
  const dir = mkdtempSync(join(tmpdir(), "pcmr-persistence-"));
  const body = validQuote();
  let instance = createApp({ dataDir: dir });
  try {
    const first = await request(instance.app)
      .post("/api/quotes")
      .send(body)
      .expect(201);
    instance.close();
    instance = createApp({ dataDir: dir });
    const retry = await request(instance.app)
      .post("/api/quotes")
      .send(body)
      .expect(200);
    assert.equal(retry.body.protocol, first.body.protocol);
  } finally {
    instance.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
