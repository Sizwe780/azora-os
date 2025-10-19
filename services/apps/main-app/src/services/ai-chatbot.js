import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-CHATBOT_URL || "http://localhost:3012";

export async function fetchAiChatbot(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-chatbot`, payload);
  return r.data;
}
