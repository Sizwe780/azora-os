/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_PRECISION-MEDICINE_URL || "http://localhost:3054";

export async function fetchPrecisionMedicine(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/precision-medicine`, payload);
  return r.data;
}
