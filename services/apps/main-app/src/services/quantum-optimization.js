import axios from "axios";
const BASE_URL = process.env.REACT_APP_QUANTUM-OPTIMIZATION_URL || "http://localhost:3020";

export async function fetchQuantumOptimization(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/quantum-optimization`, payload);
  return r.data;
}
