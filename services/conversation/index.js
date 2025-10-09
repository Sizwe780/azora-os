const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
client.collectDefaultMetrics({ prefix: "azora_convo_" });

function intent(text) {
  const t = String(text || "").toLowerCase();
  if (/where.*wrap|gluten/.test(t)) return { i: "FIND_PRODUCT", q: "gluten-free wraps" };
  if (/almond milk/.test(t)) return { i: "FIND_PRODUCT", q: "almond milk" };
  if (/replenish|front[- ]?face|expiry/.test(t)) return { i: "REPLENISH_GUIDE" };
  if (/read sop|procedure/.test(t)) return { i: "READ_SOP", q: "replenish" };
  return { i: "HELP" };
}

async function findProduct(tenant, storeId, q) {
  const products = await (await fetch(`http://store:4002/products`, { headers: { "X-Tenant": tenant } })).json();
  const match = products.find(p => p.name.toLowerCase().includes(q) || (p.synonyms || []).some(s => q.includes(s)));
  if (!match) return { answer: "Not found in this store.", sources: [] };
  const loc = await (await fetch(`http://store:4002/location/${storeId}/${match.sku}`, { headers: { "X-Tenant": tenant } })).json();
  const inv = await (await fetch(`http://store:4002/inventory/${storeId}/${match.sku}`, { headers: { "X-Tenant": tenant } })).json();
  let answer = `${match.name} → Aisle ${loc.aisle}, Bay ${loc.bay}, Shelf ${loc.shelf}.`;
  if (inv?.onHand === 0 && inv?.backroom > 0) answer += ` On-shelf empty; ${inv.backroom} in backroom — suggest replenishment.`;
  return { answer, sources: [`product:${match.sku}`, `planogram:${match.sku}`] };
}

async function readSOP(tenant, tag) {
  const sops = await (await fetch(`http://knowledge:4003/sop/search`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Tenant": tenant }, body: JSON.stringify({ query: tag })
  })).json();
  const sop = sops?.[0];
  if (!sop) return { answer: "No SOP found.", sources: [] };
  const steps = sop.steps.map(s => `${s.step}. ${s.text}`).join(" ");
  return { answer: `SOP: ${sop.title}. Steps: ${steps}`, sources: [`sop:${sop.id}`] };
}

app.post("/conversation/turn", async (req, res) => {
  const { tenant = "woolworths", storeId = "NMB-STORE-001", userId, role, text } = req.body || {};
  const { i, q } = intent(text);
  let ans = "Ask me about product locations, replenishment, SOPs, or routes.";
  let sources = [];
  let actions = [];
  if (i === "FIND_PRODUCT") { const g = await findProduct(tenant, storeId, q); ans = g.answer; sources = g.sources; }
  else if (i === "REPLENISH_GUIDE") { const g = await readSOP(tenant, "replenish"); ans = g.answer; sources = g.sources; actions.push({ type: "TASK_CREATE", payload: { type: "REPLENISH" } }); }
  else if (i === "READ_SOP") { const g = await readSOP(tenant, q); ans = g.answer; sources = g.sources; }
  res.json({ answer: ans, sources, actions, intent: i });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "conversation" }));
app.listen(process.env.PORT || 4011, () => console.log("Conversation service :4011"));
