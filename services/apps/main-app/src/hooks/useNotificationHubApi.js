import { useState, useEffect } from "react";
import { fetchNotificationHub } from "../services/notification-hub";

export default function useNotificationHubApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchNotificationHub(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
