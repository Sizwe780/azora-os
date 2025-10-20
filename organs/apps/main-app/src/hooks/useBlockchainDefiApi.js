import { useState, useEffect } from "react";
import { fetchBlockchainDefi } from "../services/blockchain-defi";

export default function useBlockchainDefiApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchBlockchainDefi(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
