import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackSession } from "../hooks/useUserJourney";
export default function JourneyTracker({ userId }) {
  const location = useLocation();
  useEffect(() => { if (userId) trackSession(userId, location.pathname); }, [location, userId]);
  return null;
}
