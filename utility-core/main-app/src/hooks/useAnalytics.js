/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
export function trackEvent(type, props={}) {
  return axios.post("http://localhost:3800/api/analytics/event", { type, ...props });
}
export async function getFunnel() {
  return axios.get("http://localhost:3800/api/analytics/funnel").then(r=>r.data.funnel);
}
export async function getHeatmap() {
  return axios.get("http://localhost:3800/api/analytics/heatmap").then(r=>r.data.heatmap);
}
