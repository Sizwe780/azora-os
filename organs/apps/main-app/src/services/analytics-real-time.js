/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_ANALYTICS-REAL-TIME_URL || "http://localhost:3032";

export async function fetchAnalyticsRealTime(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/analytics-real-time`, payload);
  return r.data;
}
