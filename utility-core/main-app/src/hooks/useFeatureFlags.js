/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useEffect, useState } from "react";
import axios from "axios";

export default function useFeatureFlags() {
  const [flags, setFlags] = useState({});
  useEffect(() => {
    axios.get("http://localhost:3400/flags").then(({data}) => setFlags(data));
  }, []);
  return flags;
}
