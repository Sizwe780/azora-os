/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState, useEffect } from "react";
import axios from "axios";

export default function useRecommendations(user, context) {
  const [recs, setRecs] = useState([]);
  useEffect(() => {
    axios.post("http://localhost:3500/api/recommend", { user, context }).then(({data}) => setRecs(data.recommendations));
  }, [user, context]);
  return recs;
}
