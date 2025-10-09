import express from "express";
import cors from "cors";
import { decide } from "../policy/index";
import fetch from "node-fetch";

const app = express(); app.use(cors()); app.use(express.json());

async function emitAudit(event: string, payload: any) {
  await fetch("http://security-core:4022/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, payload }) });
}

async function execute(action: any) {
  if (action.type === "REPLENISH_TASK") {
    await fetch("http://assistant:4000/assistant/tasks/NMB-STORE-001", { headers: { "X-Tenant": "woolworths" } });
  }
  if (action.type === "POS_UNDERSCAN") {
    await fetch("http://security-core:4022/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action.payload) });
  }
  // extend with price/energy routes
}

app.post("/orchestrate", async (req, res) => {
  const action = req.body; // {type, payload, confidence, context}
  const decision = decide(action);
  await emitAudit("orchestrator.decision", { action, decision });
  if (decision.allow && !decision.requireConfirm) {
    await execute(action); return res.json({ status: "EXECUTED", decision });
  }
  if (decision.allow && decision.requireConfirm) {
    // push to supervisor device for 1-tap confirm
    await fetch("http://voice:4010/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `Confirm action: ${action.type}. ${decision.reason}` }) });
    return res.json({ status: "AWAITING_CONFIRM", decision });
  }
  return res.json({ status: "BLOCKED", decision });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "orchestrator" }));
app.listen(process.env.PORT || 4030, () => console.log("Orchestrator :4030"));
