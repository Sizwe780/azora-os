import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-FORECASTING_URL || "http://localhost:3017";

export async function fetchAiForecasting(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-forecasting`, payload);
  return r.data;
}
