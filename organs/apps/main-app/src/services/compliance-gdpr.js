/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_COMPLIANCE-GDPR_URL || "http://localhost:3024";

export async function fetchComplianceGdpr(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/compliance-gdpr`, payload);
  return r.data;
}
