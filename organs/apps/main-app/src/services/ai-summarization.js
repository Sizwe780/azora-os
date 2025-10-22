/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-SUMMARIZATION_URL || "http://localhost:3019";

export async function fetchAiSummarization(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-summarization`, payload);
  return r.data;
}
