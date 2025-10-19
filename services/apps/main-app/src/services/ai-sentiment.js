import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-SENTIMENT_URL || "http://localhost:3011";

export async function fetchAiSentiment(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-sentiment`, payload);
  return r.data;
}
