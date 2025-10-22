/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_COLLABORATION-SUITE_URL || "http://localhost:3033";

export async function fetchCollaborationSuite(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/collaboration-suite`, payload);
  return r.data;
}
