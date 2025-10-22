/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_HEALTH-DATA-CLOUD_URL || "http://localhost:3052";

export async function fetchHealthDataCloud(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/health-data-cloud`, payload);
  return r.data;
}
