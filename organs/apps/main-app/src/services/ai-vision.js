/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_AI-VISION_URL || "http://localhost:3013";

export async function fetchAiVision(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/ai-vision`, payload);
  return r.data;
}
