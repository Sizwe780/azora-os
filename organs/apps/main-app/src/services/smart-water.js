/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_SMART-WATER_URL || "http://localhost:3059";

export async function fetchSmartWater(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/smart-water`, payload);
  return r.data;
}
