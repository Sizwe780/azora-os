/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'store';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

import express from "express";
import cors from "cors";
import client from "prom-client";
import { products, inventories, planograms } from "../../packages/data/src/seed.js";

const app = express();
app.use(cors());
app.use(express.json());

client.collectDefaultMetrics({ prefix: "azora_store_" });
const apiCounter = new client.Counter({ name: "azora_store_requests_total", help: "Store svc requests", labelNames: ["route","tenant"] });
app.use((req, res, next) => { res.on("finish", () => apiCounter.inc({ route: req.path, tenant: req.headers["x-tenant"] || "retail-partner" })); next(); });

app.get("/products", (req, res) => {
  const tenant = req.headers["x-tenant"] || "retail-partner";
  res.json(products.filter(p => p.tenant === tenant));
});

app.get("/inventory/:storeId/:sku", (req, res) => {
  const { storeId, sku } = req.params;
  const tenant = req.headers["x-tenant"] || "retail-partner";
  res.json(inventories.find(i => i.tenant === tenant && i.storeId === storeId && i.sku === sku) || {});
});

app.get("/location/:storeId/:sku", (req, res) => {
  const { storeId, sku } = req.params;
  const tenant = req.headers["x-tenant"] || "retail-partner";
  const pl = planograms.find(p => p.tenant === tenant && p.storeId === storeId && p.sku === sku);
  res.json(pl?.location || {});
});

app.get("/metrics", async (_req, res) => { res.set("Content-Type", client.register.contentType); res.end(await client.register.metrics()); });
app.get("/health", (_req, res) => res.json({ status: "ok", service: "store" }));
app.listen(process.env.PORT || 4002, () => console.log("Store service :4002"));
