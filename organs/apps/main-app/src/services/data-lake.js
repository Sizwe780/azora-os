/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_DATA-LAKE_URL || "http://localhost:3029";

export async function fetchDataLake(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/data-lake`, payload);
  return r.data;
}
