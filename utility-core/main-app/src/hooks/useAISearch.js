/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState } from "react";
import axios from "axios";
export default function useAISearch() {
  const [results, setResults] = useState([]);
  async function search(query) {
    const res = await axios.post("http://localhost:3900/api/search", { query });
    setResults(res.data.results);
  }
  return [results, search];
}
