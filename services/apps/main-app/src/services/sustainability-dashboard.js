import axios from "axios";
const BASE_URL = process.env.REACT_APP_SUSTAINABILITY-DASHBOARD_URL || "http://localhost:3050";

export async function fetchSustainabilityDashboard(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/sustainability-dashboard`, payload);
  return r.data;
}
