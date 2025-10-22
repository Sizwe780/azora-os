/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-TRANSLATION_URL || "http://localhost:3018";

export async function fetchAiTranslation(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-translation`, payload);
  return r.data;
}
