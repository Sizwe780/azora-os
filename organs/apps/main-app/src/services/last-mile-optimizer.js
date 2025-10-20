import axios from "axios";
const BASE_URL = process.env.REACT_APP_LAST-MILE-OPTIMIZER_URL || "http://localhost:3045";

export async function fetchLastMileOptimizer(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/last-mile-optimizer`, payload);
  return r.data;
}
