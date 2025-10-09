// Insight generator stub
async function generate({ intent, anomaly, quantum }) {
  let summary = `Intent: ${intent}, Anomaly: ${anomaly.anomalyScore}, Quantum Confidence: ${quantum.confidence || 'N/A'}`;
  if (anomaly.flagged) summary += ' ⚠️ Anomaly detected!';
  if (quantum.quantumAdvantage) summary += ' Quantum advantage detected.';
  return { summary };
}
module.exports = { generate };
