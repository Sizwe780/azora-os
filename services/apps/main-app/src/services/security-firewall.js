import axios from "axios";
const BASE_URL = process.env.REACT_APP_SECURITY-FIREWALL_URL || "http://localhost:3026";

export async function fetchSecurityFirewall(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/security-firewall`, payload);
  return r.data;
}
