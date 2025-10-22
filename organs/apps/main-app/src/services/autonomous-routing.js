/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_AUTONOMOUS-ROUTING_URL || "http://localhost:3041";

export async function fetchAutonomousRouting(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/autonomous-routing`, payload);
  return r.data;
}
