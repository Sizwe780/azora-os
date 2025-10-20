import axios from "axios";
const BASE_URL = process.env.REACT_APP_WASTE-MANAGEMENT_URL || "http://localhost:3058";

export async function fetchWasteManagement(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/waste-management`, payload);
  return r.data;
}
