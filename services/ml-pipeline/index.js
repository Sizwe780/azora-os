const express = require('express');
const app = express();
app.use(express.json());

let modelStatus = "untrained";
let lastResult = null;

app.post('/api/ml/train', (req,res) => {
  // Simulate training
  modelStatus = "training";
  setTimeout(() => { modelStatus = "trained"; }, 2000);
  res.json({ status: "training started" });
});

app.post('/api/ml/predict', (req,res) => {
  // Simulate prediction
  if (modelStatus !== "trained") return res.status(400).json({ error: "Model not trained" });
  const { data } = req.body;
  lastResult = { prediction: Math.random() > 0.5 ? "positive" : "negative", input: data };
  res.json(lastResult);
});

app.get('/api/ml/status', (_,res) => res.json({ modelStatus, lastResult }));

app.listen(4000, () => console.log("[ml-pipeline] running on 4000"));
