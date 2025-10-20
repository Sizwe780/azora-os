import axios from "axios";
const BASE_URL = process.env.REACT_APP_CLIMATE-PREDICTION_URL || "http://localhost:3056";

export async function fetchClimatePrediction(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/climate-prediction`, payload);
  return r.data;
}
