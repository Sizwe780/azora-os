/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState, useEffect } from "react";
export function useApi(getData, deps = []) {
  const [data, setData] = useState(null);
  useEffect(() => { getData().then(setData); }, deps);
  return data;
}
