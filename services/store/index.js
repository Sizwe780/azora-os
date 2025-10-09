const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const { products, inventories, planograms } = require("../../packages/data/src/seed");

const app = express();
app.use(cors());
app.use(express.json());

client.collectDefaultMetrics({ prefix: "azora_store_" });
const apiCounter = new client.Counter({ name: "azora_store_requests_total", help: "Store svc requests", labelNames: ["route","tenant"] });
app.use((req, res, next) => { res.on("finish", () => apiCounter.inc({ route: req.path, tenant: req.headers["x-tenant"] || "woolworths" })); next(); });

app.get("/products", (req, res) => {
  const tenant = req.headers["x-tenant"] || "woolworths";
  res.json(products.filter(p => p.tenant === tenant));
});

app.get("/inventory/:storeId/:sku", (req, res) => {
  const { storeId, sku } = req.params;
  const tenant = req.headers["x-tenant"] || "woolworths";
  res.json(inventories.find(i => i.tenant === tenant && i.storeId === storeId && i.sku === sku) || {});
});

app.get("/location/:storeId/:sku", (req, res) => {
  const { storeId, sku } = req.params;
  const tenant = req.headers["x-tenant"] || "woolworths";
  const pl = planograms.find(p => p.tenant === tenant && p.storeId === storeId && p.sku === sku);
  res.json(pl?.location || {});
});

app.get("/metrics", async (_req, res) => { res.set("Content-Type", client.register.contentType); res.end(await client.register.metrics()); });
app.get("/health", (_req, res) => res.json({ status: "ok", service: "store" }));
app.listen(process.env.PORT || 4002, () => console.log("Store service :4002"));
