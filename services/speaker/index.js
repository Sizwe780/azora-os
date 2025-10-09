const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

const profiles = [
  { userId: "staff-001", name: "Thandi Mkhize", storeId: "NMB-STORE-001", role: "REPLENISHMENT", embedding: Array(13).fill(0.1) },
  { userId: "staff-002", name: "Sipho Dlamini", storeId: "NMB-STORE-001", role: "FRONTEND", embedding: Array(13).fill(0.2) },
];

function cos(a, b) { let d=0,na=0,nb=0; for(let i=0;i<Math.min(a.length,b.length);i++){d+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];} const den=Math.sqrt(na)*Math.sqrt(nb); return den?d/den:0; }

app.post("/speaker/enroll", (req, res) => {
  const { userId, name, storeId, role, pcm, sampleRate } = req.body || {};
  if (!pcm || !sampleRate) return res.status(400).json({ error: "pcm_and_sampleRate_required" });
  const embedding = Array(13).fill(0).map((_, i) => (pcm[i] || 0) * 0.001);
  const idx = profiles.findIndex(p => p.userId === userId);
  const profile = { userId, name, storeId, role, embedding };
  if (idx >= 0) profiles[idx] = profile; else profiles.push(profile);
  res.json({ ok: true, userId, name });
});

app.post("/speaker/identify", (req, res) => {
  if (req.body.sampleText) {
    const text = String(req.body.sampleText || "").toLowerCase();
    const match = profiles.find(p => text.includes(p.name.toLowerCase().split(" ")[0]));
    if (match) return res.json({ userId: match.userId, name: match.name, score: 0.91 });
    return res.json({ userId: "unknown", name: "Guest", score: 0.1 });
  }
  const { pcm, sampleRate } = req.body || {};
  if (!pcm || !sampleRate) return res.status(400).json({ error: "pcm_and_sampleRate_required" });
  const embedding = Array(13).fill(0).map((_, i) => (pcm[i] || 0) * 0.001);
  let best = { userId: "unknown", name: "Guest", score: 0 };
  for (const p of profiles) { const s = cos(embedding, p.embedding); if (s > best.score) best = { userId: p.userId, name: p.name, score: s }; }
  res.json(best);
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "speaker" }));
app.listen(process.env.PORT || 4012, () => console.log("Speaker service :4012"));
