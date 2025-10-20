import axios from "axios";
const BASE_URL = process.env.REACT_APP_SENSOR-FUSION_URL || "http://localhost:3047";

export async function fetchSensorFusion(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/sensor-fusion`, payload);
  return r.data;
}
