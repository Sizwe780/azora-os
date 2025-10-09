// Simple anomaly detector stub
async function detect(context) {
  // Replace with real ML model
  const score = Math.random();
  return { anomalyScore: score, flagged: score > 0.7 };
}
module.exports = { detect };
