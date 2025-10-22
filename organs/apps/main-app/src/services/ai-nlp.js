/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-NLP_URL || "http://localhost:3014";

export async function fetchAiNlp(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-nlp`, payload);
  return r.data;
}
