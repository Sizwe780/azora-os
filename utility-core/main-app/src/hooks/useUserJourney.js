/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
export function trackSession(userId, path) {
  return axios.post("http://localhost:3800/api/analytics/session", { userId, path });
}
export async function getUserJourney(userId) {
  return axios.get("http://localhost:3800/api/analytics/session/"+userId).then(r=>r.data.journey);
}
export async function getDropoffs() {
  return axios.get("http://localhost:3800/api/analytics/dropoffs").then(r=>r.data.dropoffs);
}
