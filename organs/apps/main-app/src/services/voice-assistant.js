import axios from "axios";
const BASE_URL = process.env.REACT_APP_VOICE-ASSISTANT_URL || "http://localhost:3064";

export async function fetchVoiceAssistant(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/voice-assistant`, payload);
  return r.data;
}
