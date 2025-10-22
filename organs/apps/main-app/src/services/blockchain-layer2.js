/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_BLOCKCHAIN-LAYER2_URL || "http://localhost:3021";

export async function fetchBlockchainLayer2(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/blockchain-layer2`, payload);
  return r.data;
}
