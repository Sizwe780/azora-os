const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const { sops } = require("../../packages/data/src/seed");

const app = express();
app.use(cors());
app.use(express.json());

client.collectDefaultMetrics({ prefix: "azora_knowledge_" });
const apiCounter = new client.Counter({ name: "azora_knowledge_requests_total", help: "Knowledge svc requests", labelNames: ["route","tenant"] });
app.use((req, res, next) => { res.on("finish", () => apiCounter.inc({ route: req.path, tenant: req.headers["x-tenant"] || "woolworths" })); next(); });

function searchSOP(query, tenant) {
  const q = String(query || "").toLowerCase();
  return sops.filter(s => s.tenant === tenant && (s.title.toLowerCase().includes(q) || (s.tags || []).some(t => t.includes(q))));
}

app.post("/sop/search", (req, res) => { const tenant = req.headers["x-tenant"] || "woolworths"; res.json(searchSOP(req.body?.query, tenant)); });
app.get("/sop/:id", (req, res) => { const sop = sops.find(s => s.id === req.params.id); if (!sop) return res.status(404).json({ error: "not_found" }); res.json(sop); });

app.get("/metrics", async (_req, res) => { res.set("Content-Type", client.register.contentType); res.end(await client.register.metrics()); });
app.get("/health", (_req, res) => res.json({ status: "ok", service: "knowledge" }));
app.listen(process.env.PORT || 4003, () => console.log("Knowledge service :4003"));
