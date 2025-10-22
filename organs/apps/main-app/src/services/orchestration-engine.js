/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_ORCHESTRATION-ENGINE_URL || "http://localhost:3072";

export async function fetchOrchestrationEngine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/orchestration-engine`, payload);
  return r.data;
}
