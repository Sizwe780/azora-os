const neuralIntent = require('./neuralIntent');
const anomalyDetector = require('./anomalyDetector');
const quantumService = require('./quantumService');
const insightGenerator = require('./insightGenerator');

async function runAllAIs(context) {
  const intent = await neuralIntent.predict(context);
  const anomaly = await anomalyDetector.detect(context);
  const quantum = await quantumService.hybridScore(context);
  const insight = await insightGenerator.generate({ intent, anomaly, quantum });
  return { intent, anomaly, quantum, insight };
}

module.exports = { runAllAIs };
