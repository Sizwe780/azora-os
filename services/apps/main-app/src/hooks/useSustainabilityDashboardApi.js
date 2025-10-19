import { useState, useEffect } from "react";
import { fetchSustainabilityDashboard } from "../services/sustainability-dashboard";

export default function useSustainabilityDashboardApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchSustainabilityDashboard(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
