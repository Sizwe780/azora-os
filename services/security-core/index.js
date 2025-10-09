const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const crypto = require("crypto");
const fs = require("fs");
const fetch = require("node-fetch");

const app = express(); app.use(cors()); app.use(express.json());
client.collectDefaultMetrics({ prefix: "azora_security_" });
const alertsCounter = new client.Counter({ name: "azora_security_alerts_total", help: "Security alerts", labelNames: ["type","severity"] });

const cameraEvents = [];
const posEvents = [];
const alerts = [];

function audit(event, payload) {
  const ts = new Date().toISOString();
  const line = JSON.stringify({ ts, event, payload });
  const hash = crypto.createHash("sha256").update(line).digest("hex");
  fs.writeFileSync("./security_audit.log", `${line} #${hash}\n`, { flag: "a" });
}

function correlate(tillId) {
  const cam = [...cameraEvents].reverse().find(e => e.tillId === tillId);
  const pos = [...posEvents].reverse().find(e => e.tillId === tillId);
  if (!cam || !pos) return;
  const bagged = cam.details?.estimatedItemsBagged || 0;
  const scanned = pos.details?.itemsScanned || 0;
  const delta = bagged - scanned;
  if (delta >= 1) {
    const alert = {
      alertId: `ALERT-${Date.now()}`,
      tenant: process.env.TENANT || "woolworths",
      storeId: process.env.STORE_ID || "NMB-STORE-001",
      type: "POS_UNDERSCAN",
      severity: delta >= 2 ? "critical" : "warning",
      cameraId: cam.cameraId,
      tillId,
      ts: new Date().toISOString(),
      details: { bagged, scanned, delta, confidence: Math.min(0.99, (cam.details?.confidence || 0.7) + 0.2) },
      status: "OPEN"
    };
    alerts.push(alert);
    alertsCounter.inc({ type: alert.type, severity: alert.severity });
    audit("security.alert", alert);
    route(alert);
  }
}

async function route(alert) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  const text = `SEC ALERT: ${alert.type} at ${alert.tillId} (cam ${alert.cameraId}) — bagged ${alert.details.bagged}, scanned ${alert.details.scanned}, Δ=${alert.details.delta}. Severity: ${alert.severity}.`;
  try { await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }); } catch {}
}

app.post("/events/camera", (req, res) => { cameraEvents.push(req.body); audit("camera.event", req.body); correlate(req.body.tillId); res.json({ ok: true }); });
app.post("/events/pos", (req, res) => { posEvents.push(req.body); audit("pos.event", req.body); correlate(req.body.tillId); res.json({ ok: true }); });

app.get("/alerts", (_req, res) => res.json(alerts.slice(-100)));
app.post("/alerts/:id/resolve", (req, res) => { const idx = alerts.findIndex(a => a.alertId === req.params.id); if (idx >= 0) alerts[idx].status = "RESOLVED"; audit("security.alert.resolve", { alertId: req.params.id }); res.json({ ok: true }); });

app.get("/metrics", async (_req, res) => { res.set("Content-Type", client.register.contentType); res.end(await client.register.metrics()); });
app.get("/health", (_req, res) => res.json({ status: "ok", service: "security-core" }));
app.listen(process.env.SEC_CORE_PORT || 4022, () => console.log("Security Core :4022"));
