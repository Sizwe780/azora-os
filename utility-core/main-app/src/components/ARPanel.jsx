import React, { useEffect } from "react";
// Simple AR.js loader (must include AR.js in public/index.html)
export default function ARPanel() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js";
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);
  return (
    <div className="card fade-in" style={{height: 400}}>
      <h3>Augmented Reality (AR.js demo)</h3>
      <a-scene embedded arjs>
        <a-marker preset="hiro">
          <a-box position="0 0.5 0" material="color: blue;"></a-box>
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </div>
  );
}
