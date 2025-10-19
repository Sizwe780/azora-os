import axios from "axios";
const BASE_URL = process.env.REACT_APP_ENERGY-GRID-AI_URL || "http://localhost:3055";

export async function fetchEnergyGridAi(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/energy-grid-ai`, payload);
  return r.data;
}
