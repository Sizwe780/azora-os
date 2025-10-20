import { useState, useEffect } from "react";
import { fetchSupplychainOrchestrator } from "../services/supplychain-orchestrator";

export default function useSupplychainOrchestratorApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchSupplychainOrchestrator(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
