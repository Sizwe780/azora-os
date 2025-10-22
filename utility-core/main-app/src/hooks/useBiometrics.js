/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
import { useState } from "react";
export default function useBiometrics() {
  const [result, setResult] = useState(null);
  async function verifyFace(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    const res = await axios.post("http://localhost:4700/api/biometrics/face-auth", formData);
    setResult(res.data);
  }
  return [result, verifyFace];
}
