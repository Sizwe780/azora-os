import express from "express";
import cors from "cors";
const app = express(); app.use(cors()); app.use(express.json());

// Simple twin: evaluate markdown impact and replenishment time
app.post("/simulate/markdown", (req, res) => {
  const { currentPrice, discountPct, velocity, expiryDays } = req.body;
  const lift = Math.min(1.8, 1 + (discountPct / 100) * 0.9) * (expiryDays < 2 ? 1.2 : 1.0);
  const marginDelta = (currentPrice * (1 - discountPct/100) * lift) - (currentPrice * velocity);
  res.json({ lift, marginDelta });
});

app.post("/simulate/replenish", (req, res) => {
  const { distanceMeters, congestionFactor } = req.body;
  const etaMin = Math.max(2, (distanceMeters / 60) * congestionFactor);
  res.json({ etaMin, risk: congestionFactor > 1.5 ? "medium" : "low" });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "simulator" }));
app.listen(process.env.PORT || 4031, () => console.log("Simulator :4031"));
