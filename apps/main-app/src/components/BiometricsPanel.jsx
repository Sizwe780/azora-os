import React, { useState } from "react";
import useBiometrics from "../hooks/useBiometrics";
export default function BiometricsPanel() {
  const [result, verifyFace] = useBiometrics();
  return (
    <div className="card fade-in">
      <h3>Biometric Face Authentication</h3>
      <input type="file" accept="image/*" onChange={e=>verifyFace(e.target.files[0])}/>
      {result && (
        <div>
          <div>Match: {result.match ? "Yes" : "No"}</div>
          <div>Score: {result.score.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
