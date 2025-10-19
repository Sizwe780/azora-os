import axios from "axios";
export async function registerDevice(deviceId, meta) {
  return axios.post("http://localhost:4600/api/iot/register", { deviceId, meta });
}
export async function sendDeviceData(deviceId, data) {
  return axios.post("http://localhost:4600/api/iot/data", { deviceId, data });
}
export async function sendCommand(deviceId, command) {
  return axios.post("http://localhost:4600/api/iot/command", { deviceId, command });
}
export async function getDevices() {
  return axios.get("http://localhost:4600/api/iot/devices").then(r=>r.data.devices);
}
