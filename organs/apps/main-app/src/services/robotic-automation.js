import axios from "axios";
const BASE_URL = process.env.REACT_APP_ROBOTIC-AUTOMATION_URL || "http://localhost:3044";

export async function fetchRoboticAutomation(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/robotic-automation`, payload);
  return r.data;
}
