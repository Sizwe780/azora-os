import { useState, useEffect } from "react";
import { fetchGreenAiOptimizer } from "../services/green-ai-optimizer";

export default function useGreenAiOptimizerApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchGreenAiOptimizer(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
