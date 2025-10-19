import axios from "axios";
const BASE_URL = process.env.REACT_APP_INCIDENT-MANAGEMENT_URL || "http://localhost:3076";

export async function fetchIncidentManagement(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/incident-management`, payload);
  return r.data;
}
