import { useState, useEffect } from "react";
import { fetchRoboticAutomation } from "../services/robotic-automation";

export default function useRoboticAutomationApi(payload) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetchRoboticAutomation(payload)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(payload)]);
  return { data, loading, error };
}
