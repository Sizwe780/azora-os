import axios from "axios";
const BASE_URL = process.env.REACT_APP_SELF-HEALING-CORE_URL || "http://localhost:3073";

export async function fetchSelfHealingCore(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/self-healing-core`, payload);
  return r.data;
}
