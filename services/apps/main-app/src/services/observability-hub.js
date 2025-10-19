import axios from "axios";
const BASE_URL = process.env.REACT_APP_OBSERVABILITY-HUB_URL || "http://localhost:3071";

export async function fetchObservabilityHub(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/observability-hub`, payload);
  return r.data;
}
