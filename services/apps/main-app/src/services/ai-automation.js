import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-AUTOMATION_URL || "http://localhost:3016";

export async function fetchAiAutomation(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-automation`, payload);
  return r.data;
}
