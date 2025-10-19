import { useEffect } from "react";
import { trackEvent } from "../hooks/useAnalytics";

export default function AnalyticsTracker({ userId }) {
  useEffect(() => { trackEvent("pageview", { userId, path: window.location.pathname }); }, [userId]);
  useEffect(() => {
    function handler(e) {
      trackEvent("click", { userId, x: e.clientX, y: e.clientY, path: window.location.pathname });
    }
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [userId]);
  return null;
}
