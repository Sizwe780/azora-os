import axios from "axios";
const BASE_URL = process.env.REACT_APP_MONETIZATION-SUBSCRIPTION_URL || "http://localhost:3027";

export async function fetchMonetizationSubscription(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/monetization-subscription`, payload);
  return r.data;
}
