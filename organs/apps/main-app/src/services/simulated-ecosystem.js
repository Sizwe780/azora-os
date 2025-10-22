/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_SIMULATED-ECOSYSTEM_URL || "http://localhost:3048";

export async function fetchSimulatedEcosystem(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/simulated-ecosystem`, payload);
  return r.data;
}
