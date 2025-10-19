import axios from "axios";
const BASE_URL = process.env.REACT_APP_GLOBALIZATION-ENGINE_URL || "http://localhost:3060";

export async function fetchGlobalizationEngine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/globalization-engine`, payload);
  return r.data;
}
