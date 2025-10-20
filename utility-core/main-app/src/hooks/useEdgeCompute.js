import axios from "axios";
export async function registerNode(nodeId, meta) {
  return axios.post("http://localhost:5400/api/edge/register", { nodeId, meta });
}
export async function scheduleTask(nodeId, task) {
  return axios.post("http://localhost:5400/api/edge/task", { nodeId, task });
}
export async function getNodeTasks(nodeId) {
  return axios.get(`http://localhost:5400/api/edge/tasks/${nodeId}`).then(r=>r.data.tasks);
}
