import { useState, useEffect } from "react";
import { fetchBioinformaticsEngine } from "../services/bioinformatics-engine";

export default function useBioinformaticsEngineApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchBioinformaticsEngine(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
