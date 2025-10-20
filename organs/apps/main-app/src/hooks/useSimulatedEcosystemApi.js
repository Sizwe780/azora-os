import { useState, useEffect } from "react";
import { fetchSimulatedEcosystem } from "../services/simulated-ecosystem";

export default function useSimulatedEcosystemApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchSimulatedEcosystem(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
