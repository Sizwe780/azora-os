import axios from "axios";
const BASE_URL = process.env.REACT_APP_BIOINFORMATICS-ENGINE_URL || "http://localhost:3053";

export async function fetchBioinformaticsEngine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/bioinformatics-engine`, payload);
  return r.data;
}
