import axios from "axios";
const BASE_URL = process.env.REACT_APP_REAL-TIME-CHAT_URL || "http://localhost:3066";

export async function fetchRealTimeChat(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/real-time-chat`, payload);
  return r.data;
}
