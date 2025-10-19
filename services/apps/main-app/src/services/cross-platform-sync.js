import axios from "axios";
const BASE_URL = process.env.REACT_APP_CROSS-PLATFORM-SYNC_URL || "http://localhost:3067";

export async function fetchCrossPlatformSync(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/cross-platform-sync`, payload);
  return r.data;
}
