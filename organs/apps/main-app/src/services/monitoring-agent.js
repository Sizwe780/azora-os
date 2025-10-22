/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_MONITORING-AGENT_URL || "http://localhost:3075";

export async function fetchMonitoringAgent(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/monitoring-agent`, payload);
  return r.data;
}
