import axios from "axios";
const BASE_URL = process.env.REACT_APP_SUPPLYCHAIN-ORCHESTRATOR_URL || "http://localhost:3042";

export async function fetchSupplychainOrchestrator(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/supplychain-orchestrator`, payload);
  return r.data;
}
