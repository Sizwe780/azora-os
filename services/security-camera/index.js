const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express(); app.use(cors()); app.use(express.json());

const cameras = [
  { cameraId: "CAM-01", name: "Till 1", zone: "TILL", tillId: "TILL-01" },
  { cameraId: "CAM-02", name: "Till 2", zone: "TILL", tillId: "TILL-02" },
  { cameraId: "CAM-07", name: "Exit Gate", zone: "EXIT" }
];

function emit() {
  setInterval(async () => {
    const cam = cameras[Math.floor(Math.random()*2)];
    const event = {
      eventId: `CAM-${Date.now()}`,
      tenant: process.env.TENANT || "woolworths",
      storeId: process.env.STORE_ID || "NMB-STORE-001",
      type: "CAM_BAGGING_ITEMS",
      cameraId: cam.cameraId,
      tillId: cam.tillId,
      ts: new Date().toISOString(),
      details: { estimatedItemsBagged: 3, confidence: 0.85 }
    };
    try {
      await fetch(`http://security-core:${process.env.SEC_CORE_PORT || 4022}/events/camera`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event) });
    } catch {}
  }, 7000);
}

app.get("/cameras", (_req, res) => res.json(cameras));
app.get("/health", (_req, res) => res.json({ status: "ok", service: "security-camera" }));
app.listen(process.env.SEC_CAMERA_PORT || 4020, () => { console.log("Security Camera :4020"); emit(); });
