import React from "react";
import useDigitalTwinEngineApi from "../../hooks/useDigitalTwinEngineApi";

const DigitalTwinEnginePanel = () => {
  const { data, loading, error } = useDigitalTwinEngineApi();
  return (
    <div className="card fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ color: "var(--accent-primary)" }}>DigitalTwinEngine Service</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "var(--error)" }}>Error: {error.message}</div>}
      {data && (
        <pre style={{
          background: "var(--bg-secondary)",
          borderRadius: "8px",
          padding: "16px",
          color: "var(--text-secondary)",
          marginTop: "16px"
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DigitalTwinEnginePanel;
