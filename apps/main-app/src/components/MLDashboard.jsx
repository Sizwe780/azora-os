import React, { useState, useEffect } from "react";
import { trainModel, predictModel, getModelStatus } from "../hooks/useMLPipeline";

export default function MLDashboard() {
  const [input, setInput] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [status, setStatus] = useState({});

  useEffect(() => { getModelStatus().then(setStatus); }, []);
  function handleTrain() {
    trainModel().then(()=>setTimeout(()=>getModelStatus().then(setStatus),2000));
  }
  function handlePredict() {
    predictModel(input).then(setPrediction);
  }
  return (
    <div className="card fade-in">
      <h2>ML Pipeline</h2>
      <div>Status: {status.modelStatus}</div>
      <button className="btn-primary" onClick={handleTrain}>Train Model</button>
      <div>
        <input className="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Input data"/>
        <button className="btn-secondary" onClick={handlePredict}>Predict</button>
      </div>
      {prediction && <div>Prediction: {prediction.prediction}</div>}
    </div>
  );
}
