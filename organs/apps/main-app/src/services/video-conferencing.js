/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_VIDEO-CONFERENCING_URL || "http://localhost:3065";

export async function fetchVideoConferencing(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/video-conferencing`, payload);
  return r.data;
}
