import axios from "axios";
const BASE_URL = process.env.REACT_APP_AGRITECH-AI_URL || "http://localhost:3057";

export async function fetchAgritechAi(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/agritech-ai`, payload);
  return r.data;
}
