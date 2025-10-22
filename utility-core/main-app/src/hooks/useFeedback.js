/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
export function sendFeedback(payload) {
  return axios.post("http://localhost:3600/api/feedback", payload);
}
export function fetchFeedback() {
  return axios.get("http://localhost:3600/api/feedback").then(res => res.data.feedback);
}
