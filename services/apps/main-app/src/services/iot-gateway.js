import axios from "axios";
const BASE_URL = process.env.REACT_APP_IOT-GATEWAY_URL || "http://localhost:3031";

export async function fetchIotGateway(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/iot-gateway`, payload);
  return r.data;
}
