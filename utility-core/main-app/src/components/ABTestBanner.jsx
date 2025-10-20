import React from "react";
import useABTest from "../hooks/useABTest";
export default function ABTestBanner({ userId }) {
  const variant = useABTest(userId);
  if (variant === "A") return <div className="card">Try our new AI Assistant (A)</div>;
  else return <div className="card">Discover the upgraded Dashboard (B)</div>;
}
