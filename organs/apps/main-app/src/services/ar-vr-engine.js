import axios from "axios";
const BASE_URL = process.env.REACT_APP_AR-VR-ENGINE_URL || "http://localhost:3030";

export async function fetchArVrEngine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ar-vr-engine`, payload);
  return r.data;
}
