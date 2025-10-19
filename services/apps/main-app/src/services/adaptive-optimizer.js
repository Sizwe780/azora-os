import axios from "axios";
const BASE_URL = process.env.REACT_APP_ADAPTIVE-OPTIMIZER_URL || "http://localhost:3049";

export async function fetchAdaptiveOptimizer(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/adaptive-optimizer`, payload);
  return r.data;
}
