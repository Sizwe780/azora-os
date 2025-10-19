import axios from "axios";
export function logEvent(event) {
  return axios.post("http://localhost:5300/api/deep-analytics/event", event);
}
export async function fetchEvents() {
  return axios.get("http://localhost:5300/api/deep-analytics/events").then(r=>r.data.events);
}
