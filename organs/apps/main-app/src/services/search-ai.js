/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_SEARCH-AI_URL || "http://localhost:3037";

export async function fetchSearchAi(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/search-ai`, payload);
  return r.data;
}
