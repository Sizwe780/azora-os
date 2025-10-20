import axios from "axios";
const BASE_URL = process.env.REACT_APP_EMOJI-AI_URL || "http://localhost:3068";

export async function fetchEmojiAi(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/emoji-ai`, payload);
  return r.data;
}
