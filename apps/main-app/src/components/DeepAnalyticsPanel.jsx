import React, { useEffect, useState } from "react";
import { fetchEvents } from "../hooks/useDeepAnalytics";
export default function DeepAnalyticsPanel() {
  const [events, setEvents] = useState([]);
  useEffect(()=>{ fetchEvents().then(setEvents); }, []);
  return (
    <div className="card fade-in">
      <h3>Deep Analytics Events</h3>
      <ul>{events.map((e,i)=><li key={i}>{JSON.stringify(e)}</li>)}</ul>
    </div>
  );
}
