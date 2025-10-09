const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const crypto = require("crypto");
const fs = require("fs");
const { products, inventories, planograms, tasks } = require("../../packages/data/src/seed");

const app = express();
app.use(cors());
app.use(express.json());

client.collectDefaultMetrics({ prefix: "azora_assistant_" });
const reqCounter = new client.Counter({ name: "azora_assistant_requests_total", help: "Assistant requests", labelNames: ["route","tenant"] });
app.use((req, res, next) => { res.on("finish", () => reqCounter.inc({ route: req.path, tenant: req.headers["x-tenant"] || "woolworths" })); next(); });

function audit(event, payload) {
  const ts = new Date().toISOString();
  const line = JSON.stringify({ ts, event, payload });
  const hash = crypto.createHash("sha256").update(line).digest("hex");
  fs.writeFileSync("./assistant_audit.log", `${line} #${hash}\n`, { flag: "a" });
}

app.post("/assistant/query", (req, res) => {
  const { tenant = "woolworths", storeId, userId, role, query } = req.body || {};
  let answer = "Ask about products, locations, tasks, or SOPs.";
  let sources = [];
  let actions = [];
  let confidence = 0.7;

  const q = String(query || "").toLowerCase();
  const product = products.find(p => p.tenant === tenant && (p.name.toLowerCase().includes(q) || (p.synonyms || []).some(s => q.includes(s))));
  if (product) {
    const loc = planograms.find(p => p.tenant === tenant && p.storeId === storeId && p.sku === product.sku)?.location;
    const inv = inventories.find(i => i.tenant === tenant && i.storeId === storeId && i.sku === product.sku);
    if (loc) {
      answer = `${product.name} → Aisle ${loc.aisle}, Bay ${loc.bay}, Shelf ${loc.shelf}.`;
      if ((inv?.onHand || 0) === 0 && (inv?.backroom || 0) > 0) {
        answer += ` On-shelf is empty; ${inv.backroom} in backroom. Creating a replenishment task.`;
        actions.push({ type: "TASK_CREATE", payload: { type: "REPLENISH", sku: product.sku, location: loc } });
      }
      confidence = 0.9;
    }
    if (product.promo) answer += ` Promo: ${product.promo}.`;
    sources.push(`product:${product.sku}`, `planogram:${product.sku}`);
  }

  if (/replenish|front[- ]?face|expiry|sop/.test(q)) {
    sources.push("sop:SOP-REPLENISH-DAIRY-V1");
    actions.push({ type: "READ_SOP", payload: { id: "SOP-REPLENISH-DAIRY-V1" } });
  }

  audit("assistant.query", { tenant, storeId, userId, role, query, answer, sources, actions });
  res.json({ answer, confidence, sources, actions, safety: {} });
});

app.get("/assistant/tasks/:storeId", (req, res) => {
  const tenant = req.headers["x-tenant"] || "woolworths";
  const storeId = req.params.storeId;
  res.json(tasks.filter(t => t.tenant === tenant && t.storeId === storeId && t.status !== "DONE"));
});

app.get("/metrics", async (_req, res) => { res.set("Content-Type", client.register.contentType); res.end(await client.register.metrics()); });
app.get("/health", (_req, res) => res.json({ status: "ok", service: "assistant" }));
app.listen(process.env.PORT || 4000, () => console.log("Assistant service :4000"));
