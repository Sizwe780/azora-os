import axios from "axios";
const BASE_URL = process.env.REACT_APP_NOTIFICATION-HUB_URL || "http://localhost:3061";

export async function fetchNotificationHub(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/notification-hub`, payload);
  return r.data;
}
