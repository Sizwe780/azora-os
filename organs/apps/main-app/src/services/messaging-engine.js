import axios from "axios";
const BASE_URL = process.env.REACT_APP_MESSAGING-ENGINE_URL || "http://localhost:3034";

export async function fetchMessagingEngine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/messaging-engine`, payload);
  return r.data;
}
