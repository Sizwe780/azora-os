import React from "react";
import useFederatedLogin from "../hooks/useFederatedLogin";

export default function FederatedLoginPanel() {
  const [profile, login] = useFederatedLogin();
  return (
    <div className="card fade-in">
      <h3>Federated Login (Google)</h3>
      <button className="btn-primary" onClick={login}>Sign in with Google</button>
      {profile && <div>Welcome, {profile.displayName} ({profile.emails[0].value})</div>}
    </div>
  );
}
