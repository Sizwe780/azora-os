import React from "react";
import useFeatureFlags from "../hooks/useFeatureFlags";
export default function FeatureFlaggedComponent() {
  const flags = useFeatureFlags();
  if (!flags.aiAssistant) return null;
  return <div className="card">AI Assistant is enabled for you!</div>;
}
