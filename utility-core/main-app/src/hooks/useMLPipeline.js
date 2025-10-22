/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
export function trainModel() {
  return axios.post("http://localhost:4000/api/ml/train");
}
export function predictModel(data) {
  return axios.post("http://localhost:4000/api/ml/predict", { data }).then(r=>r.data);
}
export function getModelStatus() {
  return axios.get("http://localhost:4000/api/ml/status").then(r=>r.data);
}
