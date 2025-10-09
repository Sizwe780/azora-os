const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express(); app.use(cors()); app.use(express.json());

function emitPOS() {
  setInterval(async () => {
    const tillId = Math.random() > 0.5 ? "TILL-01" : "TILL-02";
    const event = {
      eventId: `POS-${Date.now()}`,
      tenant: process.env.TENANT || "woolworths",
      storeId: process.env.STORE_ID || "NMB-STORE-001",
      type: "POS_TRANSACTION",
      tillId,
      ts: new Date().toISOString(),
      details: { itemsScanned: Math.random() > 0.5 ? 2 : 3, totalAmount: 199.99, items: ["WW-ALMOND-MILK-1L","WW-GLUTEN-WRAP"] }
    };
    try {
      await fetch(`http://security-core:${process.env.SEC_CORE_PORT || 4022}/events/pos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event) });
    } catch {}
  }, 8000);
}

app.post("/pos/event", async (req, res) => {
  const event = req.body;
  await fetch(`http://security-core:${process.env.SEC_CORE_PORT || 4022}/events/pos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event) });
  res.json({ ok: true });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "security-pos" }));
app.listen(process.env.SEC_POS_PORT || 4021, () => { console.log("Security POS :4021"); emitPOS(); });
