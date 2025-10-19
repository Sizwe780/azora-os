import axios from "axios";
const BASE_URL = process.env.REACT_APP_AUTOPILOT-AI_URL || "http://localhost:3079";

export async function fetchAutopilotAi(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/autopilot-ai`, payload);
  return r.data;
}
