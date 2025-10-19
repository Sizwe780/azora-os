import axios from "axios";
const BASE_URL = process.env.REACT_APP_GREEN-AI-OPTIMIZER_URL || "http://localhost:3051";

export async function fetchGreenAiOptimizer(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/green-ai-optimizer`, payload);
  return r.data;
}
