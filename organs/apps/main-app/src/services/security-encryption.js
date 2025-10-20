import axios from "axios";
const BASE_URL = process.env.REACT_APP_SECURITY-ENCRYPTION_URL || "http://localhost:3025";

export async function fetchSecurityEncryption(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/security-encryption`, payload);
  return r.data;
}
