import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-RECOMMENDATION_URL || "http://localhost:3015";

export async function fetchAiRecommendation(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-recommendation`, payload);
  return r.data;
}
