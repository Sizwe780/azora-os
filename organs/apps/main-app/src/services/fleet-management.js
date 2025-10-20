import axios from "axios";
const BASE_URL = process.env.REACT_APP_FLEET-MANAGEMENT_URL || "http://localhost:3043";

export async function fetchFleetManagement(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/fleet-management`, payload);
  return r.data;
}
