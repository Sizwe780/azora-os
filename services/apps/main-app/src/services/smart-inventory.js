import axios from "axios";
const BASE_URL = process.env.REACT_APP_SMART-INVENTORY_URL || "http://localhost:3046";

export async function fetchSmartInventory(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/smart-inventory`, payload);
  return r.data;
}
