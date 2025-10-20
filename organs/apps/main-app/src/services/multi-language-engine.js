import axios from "axios";
const BASE_URL = process.env.REACT_APP_MULTI-LANGUAGE-ENGINE_URL || "http://localhost:3062";

export async function fetchMultiLanguageEngine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/multi-language-engine`, payload);
  return r.data;
}
