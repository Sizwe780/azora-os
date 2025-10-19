import axios from "axios";
const BASE_URL = process.env.REACT_APP_TRANSLATION-WORKFLOW_URL || "http://localhost:3069";

export async function fetchTranslationWorkflow(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/translation-workflow`, payload);
  return r.data;
}
