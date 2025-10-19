import React, { useState } from "react";
import { useUserProfile, setUserPreferences } from "../hooks/usePersonalization";
export default function PersonalizationPanel({ userId }) {
  const profile = useUserProfile(userId);
  const [theme, setTheme] = useState(profile.theme || "dark");
  function save() {
    setUserPreferences(userId, { theme });
  }
  return (
    <div className="card fade-in">
      <h2>Personalization</h2>
      <label>
        Theme:
        <select className="input" value={theme} onChange={e=>setTheme(e.target.value)}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      <button className="btn-primary" onClick={save}>Save Preferences</button>
      <div>Current: {JSON.stringify(profile)}</div>
    </div>
  );
}
