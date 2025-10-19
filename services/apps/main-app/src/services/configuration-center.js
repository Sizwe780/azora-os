import axios from "axios";
const BASE_URL = process.env.REACT_APP_CONFIGURATION-CENTER_URL || "http://localhost:3077";

export async function fetchConfigurationCenter(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/configuration-center`, payload);
  return r.data;
}
