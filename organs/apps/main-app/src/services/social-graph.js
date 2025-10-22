/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_SOCIAL-GRAPH_URL || "http://localhost:3036";

export async function fetchSocialGraph(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/social-graph`, payload);
  return r.data;
}
