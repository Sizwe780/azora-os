import axios from "axios";
const BASE_URL = process.env.REACT_APP_DIGITAL-TWIN-ENGINE_URL || "http://localhost:3040";

export async function fetchDigitalTwinEngine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/digital-twin-engine`, payload);
  return r.data;
}
