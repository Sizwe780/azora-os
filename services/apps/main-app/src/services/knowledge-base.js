import axios from "axios";
const BASE_URL = process.env.REACT_APP_KNOWLEDGE-BASE_URL || "http://localhost:3035";

export async function fetchKnowledgeBase(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/knowledge-base`, payload);
  return r.data;
}
