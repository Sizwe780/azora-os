/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState } from "react";
import axios from "axios";
export default function useLLM() {
  const [result, setResult] = useState("");
  async function complete(prompt, model) {
    const r = await axios.post("http://localhost:4500/api/llm/completions", { prompt, model });
    setResult(r.data.completion);
  }
  return [result, complete];
}
