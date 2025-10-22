/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_AUTONOMOUS-OPS_URL || "http://localhost:3074";

export async function fetchAutonomousOps(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/autonomous-ops`, payload);
  return r.data;
}
