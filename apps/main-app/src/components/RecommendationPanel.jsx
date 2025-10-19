import React from "react";
import useRecommendations from "../hooks/useRecommendations";
export default function RecommendationPanel({ user, context }) {
  const recommendations = useRecommendations(user, context);
  return (
    <div className="card fade-in">
      <h2>Recommended for you</h2>
      <ul>
        {recommendations.map((r,i) => <li key={i}>{r.type}: <b>{r.name}</b></li>)}
      </ul>
    </div>
  );
}
