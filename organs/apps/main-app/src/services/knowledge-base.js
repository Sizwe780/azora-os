/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_KNOWLEDGE-BASE_URL || "http://localhost:3035";

export async function fetchKnowledgeBase(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/knowledge-base`, payload);
  return r.data;
}
