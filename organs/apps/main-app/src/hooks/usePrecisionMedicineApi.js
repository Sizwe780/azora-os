import { useState, useEffect } from "react";
import { fetchPrecisionMedicine } from "../services/precision-medicine";

export default function usePrecisionMedicineApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchPrecisionMedicine(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
